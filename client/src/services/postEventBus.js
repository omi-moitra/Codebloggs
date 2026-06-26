import { Subject } from "rxjs";

// Shared observable stream for post-creation events. Subscribers (Home, Blogs,
// Network) reload their feeds reactively instead of each maintaining their own
// window event listener.
export const postCreated$ = new Subject();

export const emitPostCreated = (post) => postCreated$.next({ post });
