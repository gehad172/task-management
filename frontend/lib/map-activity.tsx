import { Fragment } from "react";
import type { ActivityDto } from "@/types/api";
import type { ActivityItem } from "@/types/kanban";

function segmentNode(segment: ActivityDto["segments"][number], key: string) {
  switch (segment.type) {
    case "bold":
      return <span key={key} className="font-bold">{segment.value}</span>;
    case "primary":
      return (
        <span key={key} className="font-medium text-primary">
          {segment.value}
        </span>
      );
    case "italic":
      return (
        <span key={key} className="font-bold italic">
          {segment.value}
        </span>
      );
    default:
      return <Fragment key={key}>{segment.value}</Fragment>;
  }
}

export function mapActivityDtosToItems(dtos: ActivityDto[]): ActivityItem[] {
  return dtos.map((a) => {
    const body = (
      <>
        {a.segments.map((s, i) => segmentNode(s, `${a.id}-${i}`))}
      </>
    );
    if (a.kind === "user") {
      return {
        id: a.id,
        kind: "user" as const,
        avatar: a.avatar ?? "",
        body,
        time: a.time,
        showConnector: a.showConnector,
      };
    }
    return {
      id: a.id,
      kind: "system" as const,
      body,
      time: a.time,
    };
  });
}
