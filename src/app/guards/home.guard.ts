
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router , CanActivateFn } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { AuthConstants } from '../config/auth-constants';

export const homeGuard: CanActivateFn = (route, state) => {
  const storageService = inject(StorageService);
  const router = inject(Router);
  return new Promise(resolve => {
    storageService
      .get(AuthConstants.AUTH)
      .then(res => {
        if (res) {
          resolve(true);
        } else {
          router.navigate(['login']);
          resolve(false);
        }
      })
      .catch(err => {
        resolve(true);
      });
  });
};
