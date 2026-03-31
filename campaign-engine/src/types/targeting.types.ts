export type TargetingMode = 'hierarchy' | 'excel_upload';

export interface Targeting {
  mode: TargetingMode;
  hierarchy?: HierarchySelection;
  uploadedAgents?: AgentRecord[];
  uploadFileName?: string;
}

export interface HierarchySelection {
  channels: string[];
  subChannels: string[];
  designations: string[];
}

export interface AgentRecord {
  agentId: string;
  name: string;
  channel: string;
  subChannel: string;
  designation: string;
  zone: string;
  vintage: number;
}
