/** Whether focus belongs to a field, including its portaled picker. */
export function containsFieldFocus(container: HTMLElement | null, target: Element | null): boolean {
  if (!container) return false;
  if (target && container.contains(target)) return true;

  const owners = new Set(Array.from(container.querySelectorAll('[data-input-owner]'))
    .map(field => field.getAttribute('data-input-owner'))
    .filter((owner): owner is string => Boolean(owner)));
  const focusedOwner = target?.closest('[data-input-portal]')?.getAttribute('data-input-portal');
  if (focusedOwner && owners.has(focusedOwner)) return true;

  // Some browsers do not focus buttons when they are clicked. During that
  // mouse interaction activeElement can therefore be body (and relatedTarget
  // null), even though the user is still operating this field's portal.
  return Array.from(container.ownerDocument.querySelectorAll('[data-input-portal-active]'))
    .some(portal => owners.has(portal.getAttribute('data-input-portal') ?? ''));
}
