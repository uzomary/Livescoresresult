import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

type Align = "start" | "end" | "center"

type DropdownContextValue = {
  open: boolean
  setOpen: (v: boolean) => void
  rootRef: React.RefObject<HTMLDivElement>
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null)

export interface DropdownMenuProps extends React.HTMLAttributes<HTMLDivElement> { }

const DropdownMenu = ({ children, className, ...props }: DropdownMenuProps) => {
  const [open, setOpen] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const el = rootRef.current
      if (!el) return
      if (e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  return (
    <div ref={rootRef} className={cn("relative inline-block", className)} {...props}>
      <DropdownContext.Provider value={{ open, setOpen, rootRef }}>
        {children}
      </DropdownContext.Provider>
    </div>
  )
}

export interface DropdownMenuTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ asChild, className, onClick, ...props }, ref) => {
    const ctx = React.useContext(DropdownContext)
    const Comp: any = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref}
        className={className}
        onClick={(e: any) => {
          ctx?.setOpen(!ctx.open)
          onClick?.(e)
        }}
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
    if (!ctx) return null
    if (!ctx.open) return null

    const alignmentClass = align === "end" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0"

    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md mt-1",
          alignmentClass,
          className
        )}
        style={{ marginTop: sideOffset, ...style }}
        {...props}
      />
    )
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
          "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-left text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          inset && "pl-8",
          className
        )}
        onClick={(e: any) => {
          onClick?.(e)
          ctx?.setOpen(false)
        }}
        {...props}
      />
    )
  }
)
DropdownMenuItem.displayName = "DropdownMenuItem"

// Lightweight stubs to prevent import breakage; they render simple wrappers
const passthrough = (Comp: any) => Comp as any
const DropdownMenuGroup = passthrough(({ children }: any) => <div>{children}</div>)
const DropdownMenuPortal = passthrough(({ children }: any) => <>{children}</>)
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
