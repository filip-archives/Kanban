export interface Project {
  id?: string;
  title?: string;
  priority?: number;
  boards?: Board[];
}

export interface Board {
  id?: string;
  projectId: string;
  title?: string;
  priority?: number;
  tasks?: Task[];
}

export interface Task {
  description?: string;
  label?: 'purple' | 'blue' | 'green' | 'yellow' | 'red' | 'gray';
}
