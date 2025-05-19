import { SetMetadata } from '@nestjs/common';
import { AppDomain } from '../domain/app.domain';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const IS_PRIVATE_KEY = 'isPrivate';
export const Private = (permission: AppDomain.Permissions[]) => SetMetadata(IS_PRIVATE_KEY, permission);

export const IS_NOT_AVAILABLE_IN_TOUCH_KEY = 'isNotAvailableInTouch';
export const NotAvailableInTouch = () => SetMetadata(IS_NOT_AVAILABLE_IN_TOUCH_KEY, true);
