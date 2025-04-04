export type CardData = {
  card_id: string;
  question: string;
  correct_answer: string;
  group_id?: string;
  creator_id?: string;
  time_created?: string;
  time_updated?: string;
  updated_by_id?: string;
};

export type GroupData = {
  group_id: string;
  group_name: string;
  creator_id: string;
  time_created: Date;
  time_updated: Date;
};

export type UserData = {
  user_id: string;
  username: string;
  email: string;
};
