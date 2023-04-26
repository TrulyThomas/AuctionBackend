export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Account = {
  __typename?: 'Account';
  createdDate: Scalars['String'];
  email: Scalars['String'];
  id: Scalars['Int'];
  role: Scalars['String'];
  username: Scalars['String'];
};

export type Auction = {
  __typename?: 'Auction';
  bids?: Maybe<Array<Maybe<Bid>>>;
  closed: Scalars['Boolean'];
  createdDate: Scalars['String'];
  endDate: Scalars['String'];
  extendedTime: Scalars['Float'];
  id: Scalars['Int'];
  items: Array<Item>;
  startDate: Scalars['String'];
  startingPrice: Scalars['Float'];
  winner?: Maybe<Account>;
};

export type Bid = {
  __typename?: 'Bid';
  auction: Auction;
  bid: Scalars['Float'];
  id: Scalars['Int'];
};

export type Image = {
  __typename?: 'Image';
  base64data: Scalars['String'];
  id: Scalars['Int'];
  order: Scalars['Int'];
  url: Scalars['String'];
};

export type ImageInput = {
  base64data: Scalars['String'];
  id?: InputMaybe<Scalars['Int']>;
  order?: InputMaybe<Scalars['Int']>;
  url?: InputMaybe<Scalars['String']>;
};

export type Item = {
  __typename?: 'Item';
  id: Scalars['Int'];
  images?: Maybe<Array<Maybe<Image>>>;
  initialPrice: Scalars['Float'];
  name: Scalars['String'];
  quantity: Scalars['Int'];
  text?: Maybe<Scalars['String']>;
};

export type ItemInput = {
  id?: InputMaybe<Scalars['Int']>;
  images?: InputMaybe<Array<InputMaybe<ImageInput>>>;
  initialPrice?: InputMaybe<Scalars['Float']>;
  name: Scalars['String'];
  quantity?: InputMaybe<Scalars['Int']>;
  text?: InputMaybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  newItem?: Maybe<Item>;
  signup?: Maybe<Account>;
};


export type MutationNewItemArgs = {
  item: ItemInput;
};


export type MutationSignupArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
  username: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  allAuctions?: Maybe<Array<Auction>>;
  allItems: Array<Item>;
  getItem?: Maybe<Item>;
  login?: Maybe<Token>;
};


export type QueryGetItemArgs = {
  id: Scalars['Int'];
};


export type QueryLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};

export type Token = {
  __typename?: 'Token';
  account: Account;
  expiresInDays: Scalars['Float'];
  token: Scalars['String'];
};
