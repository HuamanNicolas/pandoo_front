
export class Router {
  currentRoute = $state(window.location.hash.slice(1) || '/');
  
  constructor() {
    window.addEventListener('hashchange', () => {
      this.currentRoute = window.location.hash.slice(1) || '/';
    });
  }
  
  navigate(path) {
    window.location.hash = path;
  }
  
  getParams() {
    const parts = this.currentRoute.split('/');
    return parts;
  }
}

export const router = new Router();
