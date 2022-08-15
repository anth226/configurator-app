export interface Option {
  id: string;
  sectionId: string;
  name: string;
  sayduckIds?: {[key: string]: string}[];
  photo?: string;
  sectionId?: string;
  actions?: any;
  sayduckIds?: {[key: string]: string[]}
}