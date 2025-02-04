export interface Project {
  id: string;
  name: string;
  attributes: {
    [key: string]: string | number;
  };
  jiraFields?: {
    itemType: string;
    itemKey: string;
    itemId: number;
    summary: string;
    assignee: string;
    assigneeId: string;
    reporter: string;
    reporterId: string;
    priority: string;
    status: string;
    resolution: string;
    created: string;
    updated: string;
    resolved: string;
    components: string;
    affectedVersion: string;
    fixVersion: string;
    sprints: string;
    timeTracking: string;
    internalLinks: string[];
    externalLinks: string;
    originalEstimate: number;
    parentId: number;
    parentSummary: string;
    startDate: string;
    totalOriginalEstimate: number;
    totalTimeSpent: number;
    remainingEstimate: number;
  };
}

export interface Task {
  id: string;
  itemType: string;
  itemKey: string;
  itemId: number;
  summary: string;
  assignee: string;
  assigneeId: string;
  reporter: string;
  reporterId: string;
  priority: string;
  status: string;
  resolution: string;
  created: string;
  updated: string;
  resolved: string;
  components: string;
  affectedVersion: string;
  fixVersion: string;
  sprints: string;
  timeTracking: string;
  internalLinks: string[];
  externalLinks: string;
  originalEstimate: number;
  parentId: number;
  parentSummary: string;
  startDate: string;
  totalOriginalEstimate: number;
  totalTimeSpent: number;
  remainingEstimate: number;
}

export interface Attribute {
  id: string;
  name: string;
  unit: "hours" | "quantity" | "percentage";
  type: "number" | "list" | "text";
  defaultValue?: string;
}

export interface Column {
  id: string;
  label: string;
  visible: boolean;
}

export interface View {
  id: string;
  name: string;
  columns: string[];
}