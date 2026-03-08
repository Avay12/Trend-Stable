import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { NoAuthGuard } from './core/guards/noauth.guard';

import { AppLayout } from './layout/app-layout/app-layout';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/landing-page/landing-page').then((m) => m.LandingPage),
  },
  {
    path: '',
    component: AppLayout,
    children: [
      {
        path: 'login',
    loadComponent: () => import('./features/Accounts/login/login').then((m) => m.Login),
    canActivate: [NoAuthGuard],
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/Accounts/register/register').then((m) => m.Register),
    canActivate: [NoAuthGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/user-dashboard/user-dashboard').then(
        (m) => m.UserDashboard
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './features/user-dashboard/dashboard/dashboard'
          ).then((m) => m.Dashboard),
      },
      {
        path: 'new-order',
        loadComponent: () =>
          import('./features/user-dashboard/new-order/new-order').then(
            (m) => m.NewOrder
          ),
      },
      // {
      //   path: 'services',
      //   loadComponent: () =>
      //     import(
      //       './features/user-dashboard/services/services'
      //     ).then((m) => m.Services),
      // },
      {
        path: 'market-place',
        loadComponent: () =>
          import('./features/user-dashboard/market-place/market-place').then(
            (m) => m.MarketPlace
          ),
      },
      // {
      //   path: 'vip-service',
      //   loadComponent: () =>
      //     import('./features/user-dashboard/vip-order-service/vipOrderService').then(
      //       (m) => m.VipOrderService
      //     ),
      // },
      // {
      //   path: 'cheap-service',
      //   loadComponent: () =>
      //     import('./features/user-dashboard/cheap-order-service/cheap-order-service').then(
      //       (m) => m.CheapOrderService
      //     ),
      // },
      {
        path: 'wallet',
        loadComponent: () =>
          import('./features/user-dashboard/wallet/wallet').then(
            (m) => m.Wallet
          ),
      },
      {
        path: 'payment',
        loadComponent: () =>
          import('./features/user-dashboard/payment/payment').then(
            (m) => m.Payment
          ),
      },
      {
        path: 'payment-details',
        loadComponent: () =>
          import(
            './features/user-dashboard/payment-details/payment-details'
          ).then((m) => m.PaymentDetails),
      },
      {
        path: 'payment-status',
        loadComponent: () =>
          import(
            './features/user-dashboard/payment-status/payment-status'
          ).then((m) => m.PaymentStatus),
      },
      {
        path: 'order/history',
        loadComponent: () =>
          import(
            './features/user-dashboard/order-history/order-history'
          ).then((m) => m.OrderHistory),
      },
      {
        path: 'how-to-use',
        loadComponent: () =>
          import('./features/user-dashboard/how-to-use/how-to-use').then(
            (m) => m.HowToUse
          ),
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('./features/user-dashboard/cart/cart').then(
            (m) => m.Cart
          ),
      },
      {
        path: 'referrals',
        loadComponent: () =>
          import(
            './features/user-dashboard/referrals/referrals'
          ).then((m) => m.Referrals),
      },
      {
        path: 'api-portal',
        loadComponent: () =>
          import('./features/user-dashboard/api-portal/api-portal').then(
            (m) => m.ApiPortal
          ),
      },
      {
        path: 'feedback',
        loadComponent: () =>
          import('./features/user-dashboard/feedback/feedback').then(
            (m) => m.Feedback
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import(
            './features/user-dashboard/setting/setting'
          ).then((m) => m.Setting),
      },
      {
        path: 'support',
        loadComponent: () =>
          import(
            './features/user-dashboard/support/support'
          ).then((m) => m.Support),
      },
      {
        path: 'loyalty-tier',
        loadComponent: () =>
          import(
            './features/user-dashboard/loyalty-card/loyalty-card'
          ).then((m) => m.LoyaltyCard),
      },
      {
        path: 'about-us',
        loadComponent: () =>
          import(
            './features/user-dashboard/about-us/about-us'
          ).then((m) => m.AboutUs),
      },
    ],
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin-dashboard/admin-dashboard').then(
        (m) => m.AdminDashboard
      ),
    children: [
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/admin-dashboard/orders/orders').then(
            (m) => m.AdminOrders
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin-dashboard/users/users').then(
            (m) => m.Users
          ),
      },
      {
        path: 'market-accounts',
        loadComponent: () =>
          import('./features/admin-dashboard/market-accounts/market-accounts').then(
            (m) => m.AdminMarketAccounts
          ),
      },
      {
        path: 'payment-orders',
        loadComponent: () =>
          import('./features/admin-dashboard/payment-orders/payment-orders').then(
            (m) => m.PaymentOrdersComponent
          ),
      },
      {
        path: 'crypto-payments',
        loadComponent: () =>
          import('./features/admin-dashboard/crypto-payments/crypto-payments').then(
            (m) => m.CryptoPaymentsComponent
          ),
      },
      {
        path: 'provider-balance',
        loadComponent: () =>
          import('./features/admin-dashboard/provider-balance/provider-balance').then(
            (m) => m.ProviderBalanceComponent
          ),
      },
      {
        path: 'margin',
        loadComponent: () =>
          import('./features/admin-dashboard/margin/margin').then(
            (m) => m.MarginComponent
          ),
      },
      {
        path: 'statistics',
        loadComponent: () =>
          import('./features/admin-dashboard/statistics/statistics').then(
            (m) => m.StatisticsComponent
          ),
      },
      {
        path: 'marketing',
        loadComponent: () =>
          import('./features/admin-dashboard/marketing/marketing').then(
            (m) => m.MarketingComponent
          ),
      },
      {
        path: '',
        redirectTo: 'orders',
        pathMatch: 'full'
      }
    ],
    canActivate: [authGuard],
  },
  {
    path: 'oauth/callback',
    loadComponent: () => import('./features/auth/oauth-callback/oauth-callback.component').then(m => m.OAuthCallbackComponent),
    canActivate: [NoAuthGuard] // Use NoAuthGuard so it doesn't redirect if not yet fully authenticated in frontend state
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
    ]
  }
];
