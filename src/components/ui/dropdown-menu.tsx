import * as React from "react"
import { createPortal } from "react-dom"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

type Align = "start" | "end" | "center"

type DropdownContextValue = {
  open: boolean
  setOpen: (v: boolean) => void
  rootRef: React.RefObject<HTMLDivElement>
  triggerRect: DOMRect | null
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null)

export interface DropdownMenuProps extends React.HTMLAttributes<HTMLDivElement> { }

const DropdownMenu = ({ children, className, ...props }: DropdownMenuProps) => {
  const [open, setOpen] = React.useState(false)
  const [triggerRect, setTriggerRect] = React.useState<DOMRect | null>(null)
  const rootRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const el = rootRef.current
      if (!el) return
      if (e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("click", onDocClick)
    }
    return () => document.removeEventListener("click", onDocClick)
  }, [open])

  return (
    <div ref={rootRef} className={cn("relative inline-block", className)} {...props}>
      <DropdownContext.Provider value={{ open, setOpen, rootRef, triggerRect }}>
        {React.Children.map(children, child => {
          if (React.isValidElement(child) && child.type === DropdownMenuTrigger) {
            return React.cloneElement(child as React.ReactElement<any>, {
              onRectChange: (rect: DOMRect) => setTriggerRect(rect)
            })
          }
          return child
        })}
      </DropdownContext.Provider>
    </div>
  )
}

export interface DropdownMenuTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  onRectChange?: (rect: DOMRect) => void
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ asChild, className, onClick, onRectChange, ...props }, ref) => {
    const ctx = React.useContext(DropdownContext)
    const internalRef = React.useRef<HTMLButtonElement>(null)
    const combinedRef = (node: HTMLButtonElement) => {
      (internalRef as any).current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as any).current = node;
    }

    const Comp: any = asChild ? Slot : "button"

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (internalRef.current) {
        onRectChange?.(internalRef.current.getBoundingClientRect())
      }
      ctx?.setOpen(!ctx.open)
      onClick?.(e as any)
    }

    return (
      <Comp
        ref={combinedRef}
        type={asChild ? undefined : "button"}
        className={className}
        onClick={handleClick}
        {...props}
      />
    )
  }
)
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: Align
  sideOffset?: number
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, align = "start", sideOffset = 4, style, ...props }, ref) => {
    const ctx = React.useContext(DropdownContext)
    if (!ctx || !ctx.open || !ctx.triggerRect) return null

    const top = ctx.triggerRect.bottom + window.scrollY + sideOffset;
    let left = ctx.triggerRect.left + window.scrollX;

    if (align === "end") {
      left = ctx.triggerRect.right + window.scrollX - 192; // Default width 48 * 4 = 192px
    } else if (align === "center") {
      left = ctx.triggerRect.left + window.scrollX + (ctx.triggerRect.width / 2) - 96;
    }

    const dropdown = (
      <div
        ref={ref}
        className={cn(
          "fixed z-[100] min-w-[8rem] overflow-hidden rounded-md border bg-white dark:bg-[#00141e] p-1 text-popover-foreground shadow-xl animate-in fade-in zoom-in-95 duration-100",
          className
        )}
        style={{
          top,
          left,
          position: 'fixed',
          ...style
        }}
        onClick={(e) => e.stopPropagation()}
        {...props}
      />
    )

    return createPortal(dropdown, document.body)
  }
)
DropdownMenuContent.displayName = "DropdownMenuContent"

export interface DropdownMenuItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  inset?: boolean
}

const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ className, inset, asChild = false, onClick, ...props }, ref) => {
    const ctx = React.useContext(DropdownContext)
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : "button"}
        role="menuitem"
        className={cn(
          "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-left text-sm outline-none transition-colors hover:bg-gray-100 dark:hover:bg-white/5 focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          inset && "pl-8",
          className
        )}
        onClick={(e: any) => {
          e.stopPropagation()
          onClick?.(e)
          ctx?.setOpen(false)
        }}
        {...props}
      />
    )
  }
)
DropdownMenuItem.displayName = "DropdownMenuItem"

// Lightweight stubs to prevent import breakage
const passthrough = (Comp: any) => Comp as any
const DropdownMenuPortal = passthrough(({ children }: any) => <>{children}</>)
const DropdownMenuGroup = passthrough(({ children }: any) => <div>{children}</div>)
const DropdownMenuSub = passthrough(({ children }: any) => <div>{children}</div>)
const DropdownMenuSubContent = passthrough(({ children, className }: any) => (
  <div className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg", className)}>{children}</div>
))
const DropdownMenuSubTrigger = passthrough(({ children, className }: any) => (
  <button type="button" className={cn("flex items-center px-2 py-1.5 text-sm", className)}>{children}</button>
))
const DropdownMenuRadioGroup = passthrough(({ children }: any) => <div>{children}</div>)
const DropdownMenuCheckboxItem = passthrough(({ children, className, ...props }: any) => (
  <button type="button" className={cn("relative flex w-full select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-left text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground", className)} {...props}>{children}</button>
))
const DropdownMenuRadioItem = passthrough(({ children, className, ...props }: any) => (
  <button type="button" className={cn("relative flex w-full select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-left text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground", className)} {...props}>{children}</button>
))
const DropdownMenuLabel = passthrough(({ children, inset, className }: any) => (
  <div className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}>{children}</div>
))
const DropdownMenuSeparator = passthrough(({ className }: any) => (
  <div className={cn("-mx-1 my-1 h-px bg-muted", className)} />
))
const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("ml-auto text-xs tracking-widest opacity-60", className)} {...props} />
)
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
