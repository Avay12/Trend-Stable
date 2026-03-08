import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, timeout } from 'rxjs/operators';
import { Router } from '@angular/router';
// import { Session } from '../../shared/models/session';

interface User {
  id: string;
  email: string;
  provider: string;
  role: string;
  balance: number;
  currency: string;
  username: string;
  status: boolean;
  isActive: boolean;
  createdAt: string;
  loyalty: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router); // Replace with your actual API URL
  // private apiUrl = 'http://localhost:3001/api/auth';
  private apiUrl = 'https://smmstable.com/api/auth';
  currentUser = signal<User | null>(null);
  isLoggedIn = signal(false);
  authChecked = signal(false);

  // Inside AuthService class
  private authStateSubject = new BehaviorSubject<{
    checked: boolean;
    loggedIn: boolean;
  }>({
    checked: false,
    loggedIn: false,
  });

  authState$ = this.authStateSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if user is already logged in
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    // console.log('Is authenticated:', isAuthenticated);

    if (isAuthenticated) {
      this.isLoggedIn.set(true);
      this.getUserInfo().subscribe({
        next: () => {
          this.authStateSubject.next({ checked: true, loggedIn: true });
        },
        error: (err) => {
          console.error('Failed to get user info:', err);
          // Clear auth data if we can't verify the session
          localStorage.removeItem('isAuthenticated');
          this.isLoggedIn.set(false);
          this.authStateSubject.next({ checked: true, loggedIn: false });
        },
      });
    } else {
      this.authStateSubject.next({ checked: true, loggedIn: false });
    }
  }

  login(email: string, password: string): Observable<any> {
    // For demo purposes, you can replace this with a mock response
    return this.http
      .post<any>(`${this.apiUrl}/login`, { email, password }, { withCredentials: true })
      .pipe(
        tap((response) => {
          if (response) {
            localStorage.setItem('isAuthenticated', JSON.stringify(true));
            this.currentUser.set(response.user);
            this.isLoggedIn.set(true);
            this.authStateSubject.next({ checked: true, loggedIn: true });
          }
        }),
      );
  }

  loginWithGoogle(ref?: string | null) {
    let url = 'https://smmstable.com/api/oauth/google';
    if (ref) {
      url += `?ref=${ref}`;
    }
    window.location.href = url;
  }

  getUserInfo() {
    return this.http.get<User>(this.apiUrl + '/me', { withCredentials: true }).pipe(
      timeout(5000), // 5 second timeout
      map((user) => {
        this.currentUser.set(user);
      }),
    );
  }

  getUserRole(): string {
    const user = this.currentUser();
    return user!.role; // returns 'admin' or 'user'
  }

  getAllUsers(role: string = '', search: string = '') {
    const params = {
      role,
      search,
    };
    return this.http.get<User[]>(this.apiUrl + '/users', { params, withCredentials: true });
  }

  updateUser(updateData: Partial<User>) {
    return this.http
      .put<User>(this.apiUrl + '/update-profile/' + updateData.id, updateData, {
        withCredentials: true,
      })
      .pipe(
        tap(() => {
          this.currentUser.update((user) => {
            if (user) {
              if (updateData.balance) user.balance = updateData.balance;
              if (updateData.email) user.email = updateData.email;
              if (updateData.username) user.username = updateData.username;
              if (updateData.isActive) user.isActive = updateData.isActive;
            }
            return user;
          });
        }),
      );
  }

  register(email: string, password: string, ref?: string | null): Observable<any> {
    // For demo purposes, you can replace this with a mock response
    const payload: any = { email, password };
    if (ref) {
      payload.ref = ref;
    }

    return this.http
      .post<any>(
        `${this.apiUrl}/register`,
        payload,
        { withCredentials: true },
      )
      .pipe(
        tap((response) => {
          if (response) {
            localStorage.setItem('isAuthenticated', JSON.stringify(true));
            this.currentUser.set(response.user);
            this.isLoggedIn.set(true);
            this.authStateSubject.next({ checked: true, loggedIn: true });
          }
        }),
      );
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.http.put(
      this.apiUrl + '/change-password',
      { currentPassword, newPassword },
      { withCredentials: true },
    );
  }

  updateUserById(id: string, updateData: Partial<User>) {
    const { id: _, ...datawithoutId } = updateData;
    return this.http.put<User>(`${this.apiUrl}/update-profile/${id}`, datawithoutId, {
      withCredentials: true,
    });
  }

  deleteUser(id: string) {
    return this.http.delete<User>(`${this.apiUrl}/delete-account/${id}`, {
      withCredentials: true,
    });
  }

  // Update logout to handle cookie clearing
  logout() {
    return this.http.post(this.apiUrl + '/logout', {}, { withCredentials: true }).pipe(
      tap(() => this.clearAuthData()),
      catchError(() => {
        this.clearAuthData();
        this.authStateSubject.next({ checked: true, loggedIn: false });
        return of(null);
      }),
    );
  }

  clearAuthData() {
    // Changed from private to public
    localStorage.removeItem('isAuthenticated');
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate(['/login'], {
      queryParams: { sessionRevoked: 'true' },
    });
  }

  getAuthState() {
    return this.http.get<{ isAuthenticated: boolean }>(this.apiUrl + '/auth-status', {
      withCredentials: true,
    });
  }
}
