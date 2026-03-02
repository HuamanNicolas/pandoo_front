import { onAuthChange, getCurrentUser } from '../services/authService.js';
import { getUserData } from '../services/firestoreService.js';


class UserStore {
  user = $state(null);
  userData = $state(null);
  loading = $state(true);
  error = $state(null);
  
  isAuthenticated = $derived(this.user !== null);
  isPremium = $derived(this.userData?.isPremium || this.userData?.rol === 'admin');
  
  constructor() {
    onAuthChange(async (firebaseUser) => {
      this.user = firebaseUser;
      this.loading = true;
      this.error = null;
      
      if (firebaseUser) {
        const result = await getUserData(firebaseUser.uid);
        if (result.success) {
          this.userData = result.data;
        } else {
          this.error = result.error;
        }
      } else {
        this.userData = null;
      }
      
      this.loading = false;
    });
  }
  
  async refreshUserData() {
    if (!this.user) return;
    
    this.loading = true;
    const result = await getUserData(this.user.uid);
    
    if (result.success) {
      this.userData = result.data;
      this.error = null;
    } else {
      this.error = result.error;
    }
    
    this.loading = false;
  }
  
  clear() {
    this.user = null;
    this.userData = null;
    this.error = null;
  }
}

export const userStore = new UserStore();
