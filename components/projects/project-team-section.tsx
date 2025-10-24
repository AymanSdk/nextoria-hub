"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Users, Mail, UserCircle } from "lucide-react";

interface TeamMember {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string | null;
}

interface ProjectTeamSectionProps {
  members: TeamMember[];
}

export function ProjectTeamSection({ members }: ProjectTeamSectionProps) {
  if (members.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            No team members assigned yet
          </p>
        </CardContent>
      </Card>
    );
  }

  const getRoleBadgeVariant = (role: string | null) => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return "default";
      case "MEMBER":
        return "secondary";
      case "CLIENT":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          Team Members ({members.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map((member) => (
            <HoverCard key={member.id}>
              <HoverCardTrigger asChild>
                <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={member.image || undefined} alt={member.name || ""} />
                      <AvatarFallback>
                        {member.name?.substring(0, 2).toUpperCase() || "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {member.name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.email || "No email"}
                      </p>
                    </div>
                  </div>
                  {member.role && (
                    <Badge variant={getRoleBadgeVariant(member.role) as any} className="text-xs">
                      {member.role}
                    </Badge>
                  )}
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-72">
                <div className="flex gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={member.image || undefined} alt={member.name || ""} />
                    <AvatarFallback className="text-lg">
                      {member.name?.substring(0, 2).toUpperCase() || "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2 flex-1">
                    <div>
                      <h4 className="text-sm font-semibold">{member.name}</h4>
                      {member.role && (
                        <Badge
                          variant={getRoleBadgeVariant(member.role) as any}
                          className="text-xs mt-1"
                        >
                          {member.role}
                        </Badge>
                      )}
                    </div>
                    {member.email && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

