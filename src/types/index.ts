export interface ListItem {
  id: string;
  text: string;
  completed: boolean;
  order: number;
}

export interface List {
  id: string;
  name: string;
  color: string;
  order: number;
  items: ListItem[];
}
