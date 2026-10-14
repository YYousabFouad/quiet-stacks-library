import { StorageService } from './core/storage/storage-service.js';
import { LibraryServices } from './services/library-services.js';

export const libraryServices = new LibraryServices(StorageService);
