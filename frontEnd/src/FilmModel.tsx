import { makeAutoObservable } from 'mobx';
// import { resolvePromise } from './resolvePromise.js';

interface Film {
  id: string;
  title: string;
  year: number;
  director: string;
  rating: number;
  // etc.
}

interface User {
  id: string;
  name: string;
  email: string;
  // etc.
}

interface SearchParams {
  [key: string]: unknown;
}

class PromiseState {
  promise: Promise<unknown> | null = null;
  data: unknown = null;
  error: Error | null = null;
}

class FilmModel {
  // Stored in the model and would also be in the Firebase
  currentFilm: Film | null = null;

  user: User = {
    id: '',
    name: '',
    email: '',
  };

  ready: boolean | null = null;

  searchParams: SearchParams = {};
  searchResultsPromiseState: PromiseState;
  currentFilmPromiseState: PromiseState;

  constructor() {
    makeAutoObservable(this);

    this.searchResultsPromiseState = new PromiseState();
    this.currentFilmPromiseState = new PromiseState();
  }
}

export const model = new FilmModel();
