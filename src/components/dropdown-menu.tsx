"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cva, type VariantProps } from "class-variance-authority"
import { AnimatePresence, motion, useReducedMotion, type HTMLMotionProps } from "framer-motion"

import { cn } from "../utils.js"

type DropdownSide = "top" | "right" | "bottom" | "left"
type DropdownAlign = "start" | "center" | "end"

interface DropdownMenuContextType {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLElement | null>
  contentId: string
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType | undefined>(undefined)

function useDropdownMenu() {
  const context = React.useContext(DropdownMenuContext)

  if (!context) {
    throw new Error("DropdownMenu components must be used within DropdownMenu")
  }

  return context
}

export interface DropdownMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

function DropdownMenu({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  className,
  ...props
}: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const triggerRef = React.useRef<HTMLElement>(null)
  const contentId = React.useId()
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const setOpen = React.useCallback((nextOpen: boolean) => {
    if (!isControlled) setInternalOpen(nextOpen)
    onOpenChange?.(nextOpen)
  }, [isControlled, onOpenChange])

  React.useEffect(() => {
    if (!open) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [open, setOpen])

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef, contentId }}>
      <div className={cn("relative inline-flex", className)} {...props}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

export interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  function DropdownMenuTrigger({ className, children, asChild, onClick, onKeyDown, ...props }, forwardedRef) {
    const { open, setOpen, triggerRef, contentId } = useDropdownMenu()

    const setTriggerRef = React.useCallback((node: HTMLElement | null) => {
      triggerRef.current = node
      if (typeof forwardedRef === "function") forwardedRef(node as HTMLButtonElement | null)
      else if (forwardedRef) forwardedRef.current = node as HTMLButtonElement | null
    }, [forwardedRef, triggerRef])

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      onClick?.(event as React.MouseEvent<HTMLButtonElement>)
      if (!event.defaultPrevented) setOpen(!open)
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
      onKeyDown?.(event as React.KeyboardEvent<HTMLButtonElement>)
      if (event.defaultPrevented) return

      if (["Enter", " ", "ArrowDown"].includes(event.key)) {
        event.preventDefault()
        setOpen(true)
      }
    }

    const sharedProps = {
      "aria-controls": contentId,
      "aria-expanded": open,
      "aria-haspopup": "menu" as const,
      "data-state": open ? "open" : "closed",
      onClick: handleClick,
      onKeyDown: handleKeyDown,
    }

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<any>
      return React.cloneElement(child, {
        ...sharedProps,
        ref: setTriggerRef,
        role: child.props.role ?? "button",
        tabIndex: child.props.tabIndex ?? 0,
        className: cn("focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", child.props.className, className),
        onClick: (event: React.MouseEvent<HTMLElement>) => {
          child.props.onClick?.(event)
          if (!event.defaultPrevented) handleClick(event)
        },
        onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
          child.props.onKeyDown?.(event)
          if (!event.defaultPrevented) handleKeyDown(event)
        },
      })
    }

    return (
      <button
        ref={setTriggerRef}
        type="button"
        className={cn(
          "inline-flex items-center justify-center rounded-lg text-sm font-medium ring-offset-background transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        {...sharedProps}
        {...props}
      >
        {children}
      </button>
    )
  },
)

const dropdownContentVariants = cva(
  "z-[100] max-h-[min(28rem,calc(100vh-1rem))] max-w-[calc(100vw-1rem)] overflow-y-auto overscroll-contain rounded-xl border text-foreground outline-none",
  {
    variants: {
      variant: {
        default: "border-border/70 bg-card shadow-lg",
        elevated: "border-border/60 bg-card shadow-2xl shadow-black/20",
        glass: "border-border/50 bg-card/90 shadow-2xl shadow-black/25 backdrop-blur-xl",
        minimal: "border-border/50 bg-background shadow-md",
      },
      size: {
        sm: "min-w-40 p-1",
        md: "min-w-56 p-1.5",
        lg: "min-w-72 p-2",
      },
    },
    defaultVariants: { variant: "elevated", size: "md" },
  },
)

export interface DropdownMenuContentProps
  extends Omit<HTMLMotionProps<"div">, "children">,
    VariantProps<typeof dropdownContentVariants> {
  children: React.ReactNode
  align?: DropdownAlign
  side?: DropdownSide
  sideOffset?: number
  alignOffset?: number
  collisionPadding?: number
  matchTriggerWidth?: boolean
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  function DropdownMenuContent({
    className,
    children,
    align = "end",
    side = "bottom",
    sideOffset = 8,
    alignOffset = 0,
    collisionPadding = 8,
    matchTriggerWidth = false,
    variant,
    size,
    onKeyDown,
    style,
    ...props
  }, forwardedRef) {
    const { open, setOpen, triggerRef, contentId } = useDropdownMenu()
    const contentRef = React.useRef<HTMLDivElement>(null)
    const reduceMotion = useReducedMotion()
    const [position, setPosition] = React.useState({ top: 0, left: 0, ready: false, side })

    React.useImperativeHandle(forwardedRef, () => contentRef.current as HTMLDivElement)

    const updatePosition = React.useCallback(() => {
      const trigger = triggerRef.current
      const content = contentRef.current
      if (!trigger || !content) return

      const triggerRect = trigger.getBoundingClientRect()
      const contentRect = content.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      let resolvedSide = side

      const space = {
        top: triggerRect.top,
        right: viewportWidth - triggerRect.right,
        bottom: viewportHeight - triggerRect.bottom,
        left: triggerRect.left,
      }
      const needed = side === "top" || side === "bottom" ? contentRect.height : contentRect.width
      const opposite: Record<DropdownSide, DropdownSide> = { top: "bottom", right: "left", bottom: "top", left: "right" }

      if (space[side] < needed + sideOffset && space[opposite[side]] > space[side]) {
        resolvedSide = opposite[side]
      }

      let top = 0
      let left = 0

      if (resolvedSide === "top" || resolvedSide === "bottom") {
        top = resolvedSide === "bottom"
          ? triggerRect.bottom + sideOffset
          : triggerRect.top - contentRect.height - sideOffset
        left = align === "start"
          ? triggerRect.left + alignOffset
          : align === "center"
            ? triggerRect.left + (triggerRect.width - contentRect.width) / 2 + alignOffset
            : triggerRect.right - contentRect.width - alignOffset
      } else {
        left = resolvedSide === "right"
          ? triggerRect.right + sideOffset
          : triggerRect.left - contentRect.width - sideOffset
        top = align === "start"
          ? triggerRect.top + alignOffset
          : align === "center"
            ? triggerRect.top + (triggerRect.height - contentRect.height) / 2 + alignOffset
            : triggerRect.bottom - contentRect.height - alignOffset
      }

      left = Math.min(Math.max(left, collisionPadding), viewportWidth - contentRect.width - collisionPadding)
      top = Math.min(Math.max(top, collisionPadding), viewportHeight - contentRect.height - collisionPadding)
      setPosition({ top, left, ready: true, side: resolvedSide })
    }, [align, alignOffset, collisionPadding, side, sideOffset, triggerRef])

    React.useLayoutEffect(() => {
      if (!open) return
      updatePosition()
      const frame = window.requestAnimationFrame(updatePosition)
      const observer = new ResizeObserver(updatePosition)
      if (contentRef.current) observer.observe(contentRef.current)
      if (triggerRef.current) observer.observe(triggerRef.current)
      window.addEventListener("resize", updatePosition)
      window.addEventListener("scroll", updatePosition, true)

      return () => {
        window.cancelAnimationFrame(frame)
        observer.disconnect()
        window.removeEventListener("resize", updatePosition)
        window.removeEventListener("scroll", updatePosition, true)
      }
    }, [open, triggerRef, updatePosition])

    React.useEffect(() => {
      if (!open) return

      const handlePointerDown = (event: PointerEvent) => {
        const target = event.target as Node
        if (!contentRef.current?.contains(target) && !triggerRef.current?.contains(target)) setOpen(false)
      }

      document.addEventListener("pointerdown", handlePointerDown)
      return () => document.removeEventListener("pointerdown", handlePointerDown)
    }, [open, setOpen, triggerRef])

    React.useEffect(() => {
      if (!open || !position.ready) return
      const frame = window.requestAnimationFrame(() => {
        contentRef.current?.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')?.focus()
      })
      return () => window.cancelAnimationFrame(frame)
    }, [open, position.ready])

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event)
      if (event.defaultPrevented) return

      const items = Array.from(
        contentRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? [],
      )
      if (!items.length) return
      const currentIndex = items.indexOf(document.activeElement as HTMLElement)
      let nextIndex = currentIndex

      if (event.key === "ArrowDown") nextIndex = (currentIndex + 1) % items.length
      else if (event.key === "ArrowUp") nextIndex = (currentIndex - 1 + items.length) % items.length
      else if (event.key === "Home") nextIndex = 0
      else if (event.key === "End") nextIndex = items.length - 1
      else if (event.key === "Tab") setOpen(false)
      else return

      if (event.key !== "Tab") {
        event.preventDefault()
        items[nextIndex]?.focus()
      }
    }

    if (typeof document === "undefined") return null

    const origin = {
      top: "bottom center",
      right: "left center",
      bottom: "top center",
      left: "right center",
    }[position.side]

    return createPortal(
      <AnimatePresence>
        {open && (
          <motion.div
            ref={contentRef}
            id={contentId}
            role="menu"
            aria-orientation="vertical"
            data-state="open"
            data-side={position.side}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: position.side === "bottom" ? -4 : 4 }}
            animate={{ opacity: position.ready ? 1 : 0, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.16, ease: [0.22, 1, 0.36, 1] }}
            className={cn(dropdownContentVariants({ variant, size }), className)}
            onKeyDown={handleKeyDown}
            style={{
              ...style,
              position: "fixed",
              top: position.top,
              left: position.left,
              visibility: position.ready ? "visible" : "hidden",
              transformOrigin: origin,
              minWidth: matchTriggerWidth ? triggerRef.current?.getBoundingClientRect().width : undefined,
            }}
            {...props}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
    )
  },
)

const dropdownItemVariants = cva(
  "group relative flex min-h-10 w-full select-none items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm outline-none transition-colors",
  {
    variants: {
      variant: {
        default: "text-foreground hover:bg-accent focus:bg-accent focus:text-accent-foreground",
        muted: "text-muted-foreground hover:bg-accent hover:text-foreground focus:bg-accent focus:text-foreground",
        primary: "text-primary hover:bg-primary/10 focus:bg-primary/10",
        destructive: "text-destructive hover:bg-destructive/10 focus:bg-destructive/10",
        success: "text-success hover:bg-success/10 focus:bg-success/10",
      },
      size: {
        sm: "min-h-9 px-2.5 py-1.5 text-xs",
        md: "min-h-10 px-3 py-2 text-sm",
        lg: "min-h-12 px-3.5 py-2.5 text-sm",
      },
      inset: { true: "pl-9" },
      selected: { true: "bg-primary/10 text-primary" },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
)

export interface DropdownMenuItemProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof dropdownItemVariants> {
  asChild?: boolean
  disabled?: boolean
  closeOnSelect?: boolean
  icon?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  shortcut?: React.ReactNode
}

const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  function DropdownMenuItem({
    className,
    inset,
    disabled,
    asChild,
    closeOnSelect = true,
    selected,
    variant,
    size,
    icon,
    title,
    description,
    shortcut,
    children,
    onClick,
    ...props
  }, ref) {
    const { setOpen } = useDropdownMenu()

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) {
        event.preventDefault()
        return
      }
      onClick?.(event)
      if (!event.defaultPrevented && closeOnSelect) setOpen(false)
    }

    const handleItemKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
      if ((event.key === "Enter" || event.key === " ") && !disabled) {
        event.preventDefault()
        event.currentTarget.click()
      }
    }

    const itemClassName = cn(
      dropdownItemVariants({ variant, size, inset, selected }),
      disabled && "pointer-events-none opacity-45",
      className,
    )

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<any>
      return React.cloneElement(child, {
        ...props,
        ref,
        role: "menuitem",
        tabIndex: -1,
        "aria-disabled": disabled || undefined,
        className: cn(itemClassName, child.props.className),
        onClick: (event: React.MouseEvent<HTMLDivElement>) => {
          child.props.onClick?.(event)
          if (!event.defaultPrevented) handleClick(event)
        },
        onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
          child.props.onKeyDown?.(event)
          if (!event.defaultPrevented) handleItemKeyDown(event)
        },
      })
    }

    const hasStructuredContent = icon || title || description || shortcut

    return (
      <div
        ref={ref}
        role="menuitem"
        tabIndex={-1}
        aria-disabled={disabled || undefined}
        className={cn(itemClassName, "cursor-pointer!")}
        onClick={handleClick}
        onKeyDown={handleItemKeyDown}
        {...props}
      >
        {hasStructuredContent ? (
          <>
            {icon && <span className="flex size-5 shrink-0 items-center justify-center [&>svg]:size-4">{icon}</span>}
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium leading-5">{title ?? children}</span>
              {description && <span className="mt-0.5 block text-xs leading-4 text-muted-foreground">{description}</span>}
            </span>
            {shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>}
          </>
        ) : children}
      </div>
    )
  },
)

const DropdownMenuGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function DropdownMenuGroup({ className, ...props }, ref) {
    return <div ref={ref} role="group" className={cn("space-y-0.5", className)} {...props} />
  },
)

const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(function DropdownMenuLabel({ className, inset, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn("px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground", inset && "pl-9", className)}
      {...props}
    />
  )
})

export interface DropdownMenuHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  avatar?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
}

const DropdownMenuHeader = React.forwardRef<HTMLDivElement, DropdownMenuHeaderProps>(
  function DropdownMenuHeader({ className, avatar, title, description, action, ...props }, ref) {
    return (
      <div ref={ref} className={cn("flex min-w-0 items-center gap-3 rounded-lg bg-muted/40 px-3 py-3", className)} {...props}>
        {avatar && <div className="shrink-0">{avatar}</div>}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-5 text-foreground">{title}</p>
          {description && <p className="truncate text-xs leading-4 text-muted-foreground">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    )
  },
)

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function DropdownMenuSeparator({ className, ...props }, ref) {
    return <div ref={ref} role="separator" className={cn("-mx-1 my-1.5 h-px bg-border/70", className)} {...props} />
  },
)

const DropdownMenuShortcut = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  function DropdownMenuShortcut({ className, ...props }, ref) {
    return <span ref={ref} className={cn("ml-auto shrink-0 text-[10px] font-medium tracking-wide text-muted-foreground", className)} {...props} />
  },
)

DropdownMenuTrigger.displayName = "DropdownMenuTrigger"
DropdownMenuContent.displayName = "DropdownMenuContent"
DropdownMenuItem.displayName = "DropdownMenuItem"
DropdownMenuGroup.displayName = "DropdownMenuGroup"
DropdownMenuLabel.displayName = "DropdownMenuLabel"
DropdownMenuHeader.displayName = "DropdownMenuHeader"
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuHeader,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  dropdownContentVariants,
  dropdownItemVariants,
}


