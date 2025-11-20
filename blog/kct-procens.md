---
title: KinkCheck.Top 1.0 Dev Diary and partial Project Census Post-Mortem
pub: 2030-01-01
lang: en
---

[In January 2024](https://github.com/chrissxMedia/KinkCheck.Top/pull/8#issuecomment-1888770159), I started developing Procens in a KCT branch. It was supposed to become version 1.0 once everything is implemented. After a few weeks/months it became clear that that won't happen. Procens was both over-ambitious ("let's just do every feature, in one single release") and, because I had never done such a thing, made some technical decisions that I would now consider suboptimal.

## Goals

Many other improvements got mixed in (see [chrissxMedia/KinkCheck.Top#8](https://github.com/chrissxMedia/KinkCheck.Top/pull/8) or https://en.wikipedia.org/wiki/Scope_creep), but the actual bulk of Procens is:

- Store the template (`kinks` in `base.ts` (TODO Link)) in a database, which could also contain multiple templates, and multiple revisions of each template (including old KCC revisions), including forwards compatibility with "scales and compasses"
- Allow for the saving of filled out checks, not in the URL but in said DB
- User accounts seemed like the proper way to do checks ⇒ Have user profiles, save checks in them, etc
- A bunch of legal BS for storing user data

These goals have barely changed with the experience gathered over the past year.

The following should be considered before fully implementing Procens (otherwise we might be doing double the work):

- tutorial
- use `htmx` to make everything more responsive (possible spa project, maybe with view:transition (instead?))
- more kinks (getting kcc in a "finished" state)

## Technologies

Astro is awesome and it will be the primary ingredient in (static server) chrissx Media operated websites, at least for the forseeable future. Actually having a backend and proper (server-side) interactivity is a first in this project. Also, the Check frontend (currently KCT's index) has been becoming more and more complicated (including the site's `Layout`) because of the whole client-side interactivity. Those two factors obviously require a look at possible tech stacks. Many devs would probably reach for Next or some other Full-Stack Framework already, we won't.

### Preact + Supabase + Node (Procens stack)

When I started the Procens experiment or whatever my idea was, Supabase seemed like a nice minimal choice to get all of the backend problems out of the way and get back to writing horrible JavaScript. That obviously barely worked out. Practically, the whole Database I/O still requires [a lot of code](https://github.com/chrissxMedia/KinkCheck.Top/blob/procens/src/backendlib.ts) for permission checking, serialization, etc. The authentication is also only made **easier**, but not **easy**. (in some cases even harder, I'm not sure whether our backend prototype is concurrency-safe tbh) Supabase started to feel like a great helper library that makes many things easier, but tries so hard to be its own "framework" and an "all-in-one solution" that it just cannot be.

I didn't put much thought to frontend tech (I considered `htmx`, which will be explored later) and just stuck with Preact, which had already served us well. We will probably need a frontend framework/library/whatever forever, and Preact is a fine choice. I keep wishing, Astro had a very primitive way of doing interactive components, but unfortunately we live in this timeline. However, rewriting everything in `htmx` or [vanilla JS](https://docs.astro.build/en/guides/client-side-scripts/#handle-onclick-and-other-events) should definitely be considered.

For the backend, Node was the obvious choice. Since some Astro pages will have to be dynamic, doing **everything** client-side is just insane. We will need an Astro _Adapter_ for the backend. Node is the only one that we can seriously use. The Docker build is still broken and it's all a giant mess, but it's the only way forward unfortunately. Writing a backend separately could be considered, but really it only makes things more difficult, even if that backend was written in the most perfect programming language imaginable, as Astro code (e.g. check pages or user profiles) still needs info from the backend. (and client-side rendering should not be considered an option)

### The search for the best stack

At this point, Astro DB seems like the best choice for a database (ORM. the actual database used is very uninteresting, it just needs to work well enough, sqlite is fine rn). This doesn't solve authentication, but we can ignore that problem for now (we don't need user accounts yet), and there are libraries or we could just roll our own. (mid idea tbh)

Next, attempts at rewriting some components in vanilla JS/Astro (maybe using `htmx`) should be made.

And last (probably Precens 9?), we need to figure out how to fit Astro + Node into a Docker image.

#### Implementation/Results ([Precens 8](https://github.com/chrissxMedia/KinkCheck.Top/pull/10))

Astro DB has worked out pretty well for building the static site. If it actually _is_ [easy to deploy](https://docs.astro.build/en/guides/astro-db/#connect-a-libsql-database-for-production), we will see later.

I briefly tried to reimplement `ScreenshotButton` as a purely Astro component and noticed it won't be pretty early on. Having to separately bind the event handler already _feels_ wrong. And if we're even trying to do it somewhat cleanly, we have to do the "generate a new DOM element, append it, download, remove" dance again, because we don't have refs and another `document.getElementsByClassName`/`document.getElementById` would be **way** too cursed. And don't get me started on passing the `options` to the client-side script. (which would also break having multiple different screenshot buttons, right?) Astro just isn't a good component framework for anything client-side dynamic. Svelte, etc. could be a consideration, but for now we will stick to Preact and always keep vanilla Astro components and `htmx` in mind.

It's lowkey annoying to stick to the new game plan, as I would really like to tackle the whole Node / DB deployment (+ Docker) issue rn, but everything will be cleaner if we do it in the proper order.

(another day later) Ok, f- it. We're doing everything up to the point of the new deployment in Precens 8, and there might not be a Precens 9 if everything goes well.

(a bit later) Everything seems to work well. The new version will have a beta phase at `bottom.kinkcheck.top` and then we will see.

(another month later) Beta phase has been going well and yesterday I've been able to merge and release 0.8 (Precens 8) to the main site, everything seems to be going well.

I've now started working on Precens 9, which will include both some smaller fixes I realized should be made during 0.8 code review and "final prep work", basically a more or less functional version of saving checks in `internal` and whatever else might make it into 1.0.

Additionally, I've now started exploring Svelte as an alternative interactive front-end framework. The one clear advantage imo is the inline CSS, which leads to a lot less clutter in the `components` with everything nicely bundled into a single `.svelte` file.

##### A side-track on descriptions and kink education

While I've been lowkey stating that _KinkCheck doesn't do kink education_, that was only the simplest excuse to not spend a lot of time writing documents that will hardly ever help anyone. Yesterday (2nd of June 2025), while trying to fall asleep, I came up with a new idea: Each kink in a template could have a more detailed description of a "guide" (Dos and Don'ts, Tips, etc).

Ideally, this would be a bunch of Markdown files for the only template KCC and would require a lot of time and effort to maintain. We won't do that. An easier solution that I'm really trying not to get side-tracked on (it should be in something like v1.1) is either making the `description` field an `array`/`object`, or adding a new field to every kink (not very desirable as it is an `array` itself. Ideally, we would also have a split-up guide per position with a nice table. The one big issue with the approach of putting "guides" in the templates themselves is that they can't be shared across templates and tbh I'm not sure what is the ideal solution yet.

##### Notable TODOs (that aren't explicitly in the issue tracker)

- We will need an algorithm to determine the sizing of the `KinkCheck` component as well as the screenshots (and it will be very complicated and maybe we'll just have a size property of the `Template`s
- Saving `Check`s, the 1.0 feature
