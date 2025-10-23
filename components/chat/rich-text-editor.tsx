"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Mention from "@tiptap/extension-mention";
import { common, createLowlight } from "lowlight";
import { useEffect, forwardRef, useImperativeHandle, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  Code,
  Link2,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  FileCode,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MentionSuggestion } from "./mention-suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy, { Instance as TippyInstance } from "tippy.js";
import "tippy.js/dist/tippy.css";

const lowlight = createLowlight(common);

interface RichTextEditorProps {
  placeholder?: string;
  content?: string;
  onChange?: (content: string) => void;
  onSubmit?: () => void;
  editable?: boolean;
  className?: string;
  showToolbar?: boolean;
  channelId?: string;
  workspaceId?: string;
}

export interface RichTextEditorRef {
  getHTML: () => string;
  getText: () => string;
  clear: () => void;
  focus: () => void;
  isEmpty: () => boolean;
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  (
    {
      placeholder = "Type a message...",
      content = "",
      onChange,
      onSubmit,
      editable = true,
      className,
      showToolbar = true,
      channelId,
      workspaceId,
    },
    ref
  ) => {
    const [channelMembers, setChannelMembers] = useState<any[]>([]);

    // Fetch channel members for mentions
    useEffect(() => {
      if (channelId && workspaceId) {
        fetch(`/api/chat/channels/${channelId}/members`)
          .then((res) => res.json())
          .then((data) => setChannelMembers(data || []))
          .catch(console.error);
      }
    }, [channelId, workspaceId]);

    const editor = useEditor({
      immediatelyRender: false, // Fix SSR hydration issues with Next.js
      extensions: [
        StarterKit.configure({
          codeBlock: false, // We'll use code-block-lowlight instead
          heading: {
            levels: [1, 2, 3],
          },
        }),
        Placeholder.configure({
          placeholder,
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: "text-primary underline cursor-pointer hover:text-primary/80",
          },
        }),
        CodeBlockLowlight.configure({
          lowlight,
          HTMLAttributes: {
            class: "bg-muted rounded-md p-4 font-mono text-sm overflow-x-auto my-2",
          },
        }),
        Mention.configure({
          HTMLAttributes: {
            class: "mention bg-primary/10 text-primary px-1 rounded",
          },
          suggestion: {
            items: ({ query }: { query: string }) => {
              return channelMembers
                .filter((member) =>
                  member.name.toLowerCase().includes(query.toLowerCase())
                )
                .slice(0, 5);
            },
            render: () => {
              let component: ReactRenderer;
              let popup: TippyInstance[];

              return {
                onStart: (props: any) => {
                  component = new ReactRenderer(MentionSuggestion, {
                    props,
                    editor: props.editor,
                  });

                  if (!props.clientRect) {
                    return;
                  }

                  popup = tippy("body", {
                    getReferenceClientRect: props.clientRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: "manual",
                    placement: "bottom-start",
                  });
                },
                onUpdate(props: any) {
                  component.updateProps(props);

                  if (!props.clientRect) {
                    return;
                  }

                  popup[0]?.setProps({
                    getReferenceClientRect: props.clientRect,
                  });
                },
                onKeyDown(props: any) {
                  if (props.event.key === "Escape") {
                    popup[0]?.hide();
                    return true;
                  }

                  return component.ref?.onKeyDown(props);
                },
                onExit() {
                  popup[0]?.destroy();
                  component.destroy();
                },
              };
            },
          },
        }),
      ],
      content,
      editable,
      editorProps: {
        attributes: {
          class: cn(
            "prose prose-sm max-w-none focus:outline-none min-h-[60px] max-h-[200px] overflow-y-auto px-3 py-2 pb-10",
            className
          ),
        },
        handleKeyDown: (view, event) => {
          // Submit on Enter (without Shift)
          if (event.key === "Enter" && !event.shiftKey && onSubmit) {
            event.preventDefault();
            onSubmit();
            return true;
          }
          return false;
        },
      },
      onUpdate: ({ editor }) => {
        onChange?.(editor.getHTML());
      },
    });

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() || "",
      getText: () => editor?.getText() || "",
      clear: () => editor?.commands.clearContent(),
      focus: () => editor?.commands.focus(),
      isEmpty: () => editor?.isEmpty || true,
    }));

    // Update content when it changes externally
    useEffect(() => {
      if (editor && content !== editor.getHTML()) {
        editor.commands.setContent(content);
      }
    }, [content, editor]);

    if (!editor) {
      return null;
    }

    return (
      <div className='border rounded-lg overflow-hidden bg-background'>
        {showToolbar && editable && <MenuBar editor={editor} />}
        <EditorContent editor={editor} />
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";

// Formatting toolbar
function MenuBar({ editor }: { editor: Editor }) {
  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className='flex items-center gap-1 p-1 border-b bg-muted/30'>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        title='Bold (Ctrl+B)'
      >
        <Bold className='h-4 w-4' />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        title='Italic (Ctrl+I)'
      >
        <Italic className='h-4 w-4' />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        title='Inline Code (Ctrl+E)'
      >
        <Code className='h-4 w-4' />
      </ToolbarButton>

      <Separator orientation='vertical' className='mx-1 h-6' />

      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        title='Undo (Ctrl+Z)'
      >
        <Undo className='h-4 w-4' />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        title='Redo (Ctrl+Shift+Z)'
      >
        <Redo className='h-4 w-4' />
      </ToolbarButton>

      <Separator orientation='vertical' className='mx-1 h-6' />

      <ToolbarButton
        onClick={setLink}
        active={editor.isActive("link")}
        title='Add Link (Ctrl+K)'
      >
        <Link2 className='h-4 w-4' />
      </ToolbarButton>

      <Separator orientation='vertical' className='mx-1 h-6' />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title='Bullet List'
      >
        <List className='h-4 w-4' />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title='Numbered List'
      >
        <ListOrdered className='h-4 w-4' />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
        title='Code Block'
      >
        <FileCode className='h-4 w-4' />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title='Quote'
      >
        <Quote className='h-4 w-4' />
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({
  children,
  active,
  disabled,
  onClick,
  title,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title?: string;
}) {
  return (
    <Button
      type='button'
      variant='ghost'
      size='sm'
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "h-8 w-8 p-0",
        active && "bg-muted text-primary",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {children}
    </Button>
  );
}
