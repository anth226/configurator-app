import type { Option } from './option';

export interface Section {
  id: string;
  name: string;
  sayduckId?: string;
  photo?: string;
  options: Option[];
  optionOrder: string[];
}
