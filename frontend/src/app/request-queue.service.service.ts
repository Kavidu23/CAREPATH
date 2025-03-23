// request-queue.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { delay, switchMap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RequestQueueService {
  private queue: { request: Observable<any>, next: Subject<any> }[] = [];
  private isProcessing = false;

  // Queue a request and return an Observable for its result
  enqueue<T>(request: Observable<T>): Observable<T> {
    const subject = new Subject<T>();
    this.queue.push({ request, next: subject });
    this.processQueue();
    return subject.asObservable();
  }

  private processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const { request, next } = this.queue.shift()!;

    request.pipe(
      delay(1000), // 1-second delay between requests
      catchError(err => {
        if (err.status === 429) {
          console.warn('429 detected, retrying silently...');
          return request.pipe(delay(2000)); // Retry after 2 seconds if 429
        }
        console.error('Request failed:', err);
        return of(null); // Return null silently on failure
      })
    ).subscribe({
      next: value => {
        next.next(value);
        next.complete();
        this.isProcessing = false;
        this.processQueue(); // Process next in queue
      },
      error: () => {
        next.complete(); // Even on error, complete silently
        this.isProcessing = false;
        this.processQueue();
      }
    });
  }
}