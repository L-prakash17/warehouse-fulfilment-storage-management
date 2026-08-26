import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Database,
  Info,
  LayoutDashboard,
  MapPin,
  Menu,
  Package,
  Pencil,
  Plus,
  Search as SearchIcon,
  Settings2,
  ShieldCheck,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

type ProductStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';
type StorageStatus = 'Available' | 'Near Capacity' | 'Full';

type Product = {
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  storageLocation: string;
  status: ProductStatus;
};

type Storage = {
  storageId: string;
  location: string;
  capacity: number;
  occupiedSpace: number;
  availableSpace: number;
  status: StorageStatus;
};

const seedProducts: Product[] = [
  { productId: 'PRD-1001', productName: 'Wireless Keyboard', category: 'Electronics', quantity: 128, storageLocation: 'A-01-03', status: 'In Stock' },
  { productId: 'PRD-1002', productName: 'Cotton Crew T-Shirt', category: 'Apparel', quantity: 64, storageLocation: 'B-02-01', status: 'In Stock' },
  { productId: 'PRD-1003', productName: 'Stainless Water Bottle', category: 'Home & Living', quantity: 19, storageLocation: 'C-01-02', status: 'Low Stock' },
  { productId: 'PRD-1004', productName: 'USB-C Charging Cable', category: 'Electronics', quantity: 0, storageLocation: 'A-01-04', status: 'Out of Stock' },
  { productId: 'PRD-1005', productName: 'Canvas Daypack', category: 'Accessories', quantity: 47, storageLocation: 'B-01-02', status: 'In Stock' },
  { productId: 'PRD-1006', productName: 'Desk Organizer Set', category: 'Home & Living', quantity: 23, storageLocation: 'C-02-01', status: 'Low Stock' },
];

const seedStorage: Storage[] = [
  { storageId: 'LOC-A01', location: 'Aisle A · Shelf 01', capacity: 240, occupiedSpace: 184, availableSpace: 56, status: 'Available' },
  { storageId: 'LOC-B02', location: 'Aisle B · Shelf 02', capacity: 180, occupiedSpace: 151, availableSpace: 29, status: 'Near Capacity' },
  { storageId: 'LOC-C01', location: 'Aisle C · Shelf 01', capacity: 120, occupiedSpace: 72, availableSpace: 48, status: 'Available' },
  { storageId: 'LOC-D01', location: 'Dispatch staging', capacity: 80, occupiedSpace: 80, availableSpace: 0, status: 'Full' },
];

const queryClient = new QueryClient();

function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) as T : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue] as const;
}

function statusTone(status: string) {
  if (status === 'In Stock' || status === 'Available') return 'bg-[#dcefe4] text-[#266046]';
  if (status === 'Low Stock' || status === 'Near Capacity') return 'bg-[#fff0c7] text-[#8b5b09]';
  return 'bg-[#f8ded9] text-[#a44139]';
}

function deriveProductStatus(quantity: number): ProductStatus {
  if (quantity === 0) return 'Out of Stock';
  if (quantity < 25) return 'Low Stock';
  return 'In Stock';
}

function deriveStorageStatus(capacity: number, occupied: number): StorageStatus {
  if (occupied >= capacity) return 'Full';
  if (occupied / capacity >= 0.8) return 'Near Capacity';
  return 'Available';
}

function StatusPill({ status }: { status: string }) {
  return <span data-testid={`status-${status.toLowerCase().replaceAll(' ', '-')}`} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${statusTone(status)}`}><span className="size-1.5 rounded-full bg-current" />{status}</span>;
}

function Modal({ title, eyebrow, onClose, children }: { title: string; eyebrow: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102f35]/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" data-testid="modal-dialog">
      <div className="max-h-[92dvh] w-full max-w-xl overflow-auto rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div><p className="mono mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-accent">{eyebrow}</p><h2 className="text-2xl font-extrabold tracking-tight">{title}</h2></div>
          <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label="Close dialog" data-testid="button-close-dialog"><X className="size-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder, required = true }: { label: string; value: string | number; onChange: (value: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return <label className="block space-y-2"><span className="text-sm font-bold">{label}{required && <span className="ml-1 text-accent">*</span>}</span><input required={required} type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-input bg-background px-3.5 py-3 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-accent focus:ring-2 focus:ring-accent/15" /></label>;
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label className="block space-y-2"><span className="text-sm font-bold">{label}<span className="ml-1 text-accent">*</span></span><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-input bg-background px-3.5 py-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function FormActions({ onCancel, label, disabled = false }: { onCancel: () => void; label: string; disabled?: boolean }) {
  return <div className="mt-7 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} className="rounded-lg px-4 py-2.5 text-sm font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground" data-testid="button-cancel-form">Cancel</button><button disabled={disabled} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60" data-testid={`button-${label.toLowerCase().replaceAll(' ', '-')}`}><Check className="size-4" />{label}</button></div>;
}

function Logo() {
  return <Link href="/" className="flex items-center gap-3" data-testid="link-home-logo"><span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"><Boxes className="size-5" /></span><span><span className="block text-sm font-extrabold tracking-tight text-sidebar-foreground">Stackline</span><span className="mono block text-[9px] uppercase tracking-[0.17em] text-sidebar-foreground/50">Fulfilment desk</span></span></Link>;
}

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/storage', label: 'Storage', icon: MapPin },
  { href: '/search', label: 'Search records', icon: SearchIcon },
  { href: '/about', label: 'About project', icon: Info },
];

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const active = (href: string) => href === '/' ? location === '/' : location.startsWith(href);
  return <div className="min-h-[100dvh] bg-background">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col bg-sidebar px-5 py-6 md:flex">
      <Logo />
      <div className="mt-12"><p className="mono mb-3 px-3 text-[9px] uppercase tracking-[0.2em] text-sidebar-foreground/40">Workspace</p><nav className="space-y-1">{navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${active(href) ? 'bg-primary text-primary-foreground shadow-sm' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground'}`} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}><Icon className="size-[18px]" /><span>{label}</span>{active(href) && <ChevronRight className="ml-auto size-4" />}</Link>)}</nav></div>
      <div className="mt-auto rounded-2xl border border-sidebar-border bg-sidebar-accent/60 p-4"><div className="mb-3 flex items-center gap-2 text-xs font-bold text-sidebar-foreground/80"><ShieldCheck className="size-4 text-primary" />Demo workspace</div><p className="text-xs leading-relaxed text-sidebar-foreground/45">Local data is saved in your browser for this project demo.</p><button onClick={() => { localStorage.clear(); window.location.reload(); }} className="mt-3 text-xs font-bold text-primary underline-offset-4 hover:underline" data-testid="button-reset-demo">Reset demo data</button></div>
    </aside>
    <div className="md:pl-[248px]">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 px-4 py-4 backdrop-blur-md sm:px-8 md:px-10">
        <div className="flex items-center justify-between gap-4"><div className="md:hidden"><Logo /></div><div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex"><span>Workspace</span><ChevronRight className="size-3.5" /><span className="font-bold text-foreground">{navItems.find((item) => active(item.href))?.label}</span></div><div className="flex items-center gap-3"><span className="hidden rounded-full bg-[#dcefe4] px-3 py-1.5 text-xs font-bold text-[#266046] sm:inline-flex"><span className="mr-2 mt-0.5 size-1.5 rounded-full bg-[#4d9d70]" />System ready</span><button onClick={() => setMenuOpen((open) => !open)} className="rounded-lg border border-border p-2 text-muted-foreground md:hidden" aria-label="Open navigation" data-testid="button-open-navigation"><Menu className="size-5" /></button><div className="flex size-9 items-center justify-center rounded-full bg-[#dbe8e5] text-xs font-extrabold text-[#24545b]" data-testid="text-user-avatar">AK</div></div></div>
        {menuOpen && <nav className="mt-4 space-y-1 border-t border-border pt-3 md:hidden">{navItems.map(({ href, label, icon: Icon }) => <Link onClick={() => setMenuOpen(false)} key={href} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold ${active(href) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`} data-testid={`link-mobile-nav-${label.toLowerCase().replaceAll(' ', '-')}`}><Icon className="size-4" />{label}</Link>)}</nav>}
      </header>
      <main className="app-grid min-h-[calc(100dvh-73px)] px-4 py-7 sm:px-8 sm:py-10 lg:px-12">{children}</main>
    </div>
  </div>;
}

function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="mono mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-accent">{eyebrow}</p><h1 className="max-w-3xl text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p></div>{action}</div>;
}

function Dashboard() {
  const [products] = useStoredState<Product[]>('stackline-products', seedProducts);
  const [storage] = useStoredState<Storage[]>('stackline-storage', seedStorage);
  const totalUnits = products.reduce((sum, product) => sum + product.quantity, 0);
  const totalCapacity = storage.reduce((sum, item) => sum + item.capacity, 0);
  const totalOccupied = storage.reduce((sum, item) => sum + item.occupiedSpace, 0);
  const utilization = Math.round((totalOccupied / totalCapacity) * 100);
  const attention = products.filter((product) => product.status !== 'In Stock');
  return <div className="mx-auto max-w-[1400px]">
    <PageIntro eyebrow="Monday · 24 June 2024" title="Good morning, Alex." description="Here is the current pulse of your fulfilment floor. A quick scan keeps every pick moving." action={<Link href="/products" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground shadow-sm transition hover:brightness-95" data-testid="link-dashboard-add-product"><Plus className="size-4" />Add product</Link>} />
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Products in catalogue" value={products.length.toString().padStart(2, '0')} detail="Active records" icon={Package} tone="yellow" testId="metric-products" />
      <MetricCard label="Units on hand" value={totalUnits.toLocaleString()} detail="Across all locations" icon={ClipboardList} tone="teal" testId="metric-units" />
      <MetricCard label="Storage used" value={`${utilization}%`} detail={`${totalOccupied} of ${totalCapacity} spaces`} icon={MapPin} tone="blue" testId="metric-storage" />
      <MetricCard label="Needs attention" value={attention.length.toString().padStart(2, '0')} detail={attention.length ? 'Review stock levels' : 'All levels healthy'} icon={AlertTriangle} tone="coral" testId="metric-attention" />
    </section>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
      <section className="rounded-2xl border border-border bg-card p-5 soft-shadow sm:p-6"><div className="mb-6 flex items-start justify-between"><div><p className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Storage map</p><h2 className="mt-1 text-lg font-extrabold">Capacity at a glance</h2></div><Link href="/storage" className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline" data-testid="link-dashboard-storage">Manage storage <ArrowRight className="size-3.5" /></Link></div><div className="space-y-5">{storage.map((item) => <div key={item.storageId} data-testid={`card-storage-${item.storageId}`}><div className="mb-2 flex items-center justify-between text-sm"><div><span className="mono mr-2 text-xs text-muted-foreground">{item.storageId}</span><span className="font-bold">{item.location}</span></div><span className="mono text-xs text-muted-foreground">{item.occupiedSpace}/{item.capacity}</span></div><div className="h-3 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full transition-all ${item.status === 'Full' ? 'bg-[#d06459]' : item.status === 'Near Capacity' ? 'bg-primary' : 'bg-accent'}`} style={{ width: `${Math.min(100, (item.occupiedSpace / item.capacity) * 100)}%` }} /></div></div>)}</div></section>
      <section className="rounded-2xl border border-border bg-card p-5 soft-shadow sm:p-6"><div className="mb-5 flex items-start justify-between"><div><p className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Stock watch</p><h2 className="mt-1 text-lg font-extrabold">Items to review</h2></div><Link href="/search" className="text-xs font-bold text-accent hover:underline" data-testid="link-dashboard-search">Search all</Link></div><div className="space-y-1">{attention.length ? attention.map((product) => <Link href={`/products?view=${product.productId}`} key={product.productId} className="flex items-center justify-between rounded-xl p-3 transition hover:bg-muted" data-testid={`link-attention-${product.productId}`}><div className="min-w-0"><p className="truncate text-sm font-bold">{product.productName}</p><p className="mono mt-1 text-[10px] text-muted-foreground">{product.productId} · {product.storageLocation}</p></div><div className="ml-3 text-right"><p className="text-sm font-extrabold">{product.quantity}</p><StatusPill status={product.status} /></div></Link>) : <EmptyState icon={Check} title="All clear" detail="Every product is comfortably stocked." />}</div></section>
    </div>
    <section className="mt-6 rounded-2xl border border-[#24545b] bg-[#24545b] p-5 text-[#f7f1e5] sm:p-6"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div className="flex items-start gap-4"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#f6c453] text-[#193c43]"><Truck className="size-5" /></div><div><p className="mono text-[10px] uppercase tracking-[0.18em] text-[#b7d0cb]">Today's workflow</p><h2 className="mt-1 text-lg font-extrabold">Keep the handoff clean.</h2><p className="mt-1 max-w-xl text-sm leading-relaxed text-[#b7d0cb]">Check low stock before the afternoon dispatch window. Accurate location records mean faster picks and fewer misplaced items.</p></div></div><Link href="/products" className="inline-flex items-center gap-2 text-sm font-extrabold text-primary hover:underline" data-testid="link-dashboard-workflow">Review products <ArrowRight className="size-4" /></Link></div></section>
  </div>;
}

function MetricCard({ label, value, detail, icon: Icon, tone, testId }: { label: string; value: string; detail: string; icon: typeof Package; tone: string; testId: string }) {
  const colors: Record<string, string> = { yellow: 'bg-[#fff0c7] text-[#8b5b09]', teal: 'bg-[#dcefe4] text-[#266046]', blue: 'bg-[#d9e9ed] text-[#24545b]', coral: 'bg-[#f8ded9] text-[#a44139]' };
  return <div className="rounded-2xl border border-border bg-card p-5 soft-shadow" data-testid={testId}><div className="flex items-start justify-between"><div><p className="text-xs font-bold text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-extrabold tracking-[-0.05em]" data-testid={`${testId}-value`}>{value}</p></div><span className={`flex size-10 items-center justify-center rounded-xl ${colors[tone]}`}><Icon className="size-[18px]" /></span></div><p className="mt-3 text-xs text-muted-foreground">{detail}</p></div>;
}

function EmptyState({ icon: Icon, title, detail }: { icon: typeof Package; title: string; detail: string }) {
  return <div className="flex flex-col items-center justify-center px-5 py-14 text-center"><span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><Icon className="size-5" /></span><p className="font-extrabold">{title}</p><p className="mt-1 max-w-xs text-sm leading-relaxed text-muted-foreground">{detail}</p></div>;
}

function ProductForm({ initial, onSave, onClose }: { initial?: Product; onSave: (product: Product) => void; onClose: () => void }) {
  const [form, setForm] = useState<Product>(initial ?? { productId: `PRD-${Math.floor(1000 + Math.random() * 8999)}`, productName: '', category: 'Electronics', quantity: 0, storageLocation: 'A-01-01', status: 'Out of Stock' });
  const update = (key: keyof Product, value: string | number) => setForm((current) => ({ ...current, [key]: value, ...(key === 'quantity' ? { status: deriveProductStatus(Number(value)) } : {}) } as Product));
  return <Modal eyebrow={initial ? 'Edit record' : 'New record'} title={initial ? 'Update product' : 'Add a product'} onClose={onClose}><form onSubmit={(event) => { event.preventDefault(); onSave({ ...form, quantity: Number(form.quantity), status: deriveProductStatus(Number(form.quantity)) }); }}><div className="grid gap-5 sm:grid-cols-2"><Field label="Product ID" value={form.productId} onChange={(value) => update('productId', value)} placeholder="PRD-1007" /><Field label="Product name" value={form.productName} onChange={(value) => update('productName', value)} placeholder="Example: Packing tape" /><SelectField label="Category" value={form.category} onChange={(value) => update('category', value)} options={['Electronics', 'Apparel', 'Home & Living', 'Accessories', 'Packaging']} /><Field label="Quantity" type="number" value={form.quantity} onChange={(value) => update('quantity', value)} placeholder="0" /><Field label="Storage location" value={form.storageLocation} onChange={(value) => update('storageLocation', value)} placeholder="A-01-01" /><div className="rounded-lg bg-muted p-3 text-xs leading-relaxed text-muted-foreground"><span className="font-bold text-foreground">Status is automatic.</span><br />Quantity sets this product to In Stock, Low Stock, or Out of Stock.</div></div><FormActions onCancel={onClose} label={initial ? 'Save changes' : 'Add product'} /></form></Modal>;
}

function ProductDetails({ product, onClose, onEdit }: { product: Product; onClose: () => void; onEdit: () => void }) {
  return <Modal eyebrow="Product record" title={product.productName} onClose={onClose}><div className="rounded-xl bg-muted p-4"><StatusPill status={product.status} /><p className="mono mt-4 text-xs text-muted-foreground">{product.productId}</p></div><dl className="mt-5 divide-y divide-border">{[['Category', product.category], ['Quantity on hand', product.quantity.toString()], ['Storage location', product.storageLocation]].map(([label, value]) => <div className="flex items-center justify-between py-3 text-sm" key={label}><dt className="text-muted-foreground">{label}</dt><dd className="font-bold" data-testid={`detail-${label.toLowerCase().replaceAll(' ', '-')}`}>{value}</dd></div>)}</dl><div className="mt-5 flex justify-end gap-3"><button onClick={onClose} className="rounded-lg px-4 py-2.5 text-sm font-bold text-muted-foreground hover:bg-muted" data-testid="button-close-product-details">Close</button><button onClick={onEdit} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground" data-testid="button-edit-from-details"><Pencil className="size-4" />Edit product</button></div></Modal>;
}

function Products() {
  const [products, setProducts] = useStoredState<Product[]>('stackline-products', seedProducts);
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | 'view' | null>(null);
  const [selected, setSelected] = useState<Product>();
  const filtered = useMemo(() => products.filter((product) => Object.values(product).some((value) => String(value).toLowerCase().includes(query.toLowerCase()))), [products, query]);
  const saveProduct = (product: Product) => { setProducts((items) => { const exists = items.some((item) => item.productId === product.productId); return exists ? items.map((item) => item.productId === product.productId ? product : item) : [product, ...items]; }); setModal(null); };
  const removeProduct = (product: Product) => { if (window.confirm(`Delete ${product.productName}? This action cannot be undone.`)) setProducts((items) => items.filter((item) => item.productId !== product.productId)); };
  return <div className="mx-auto max-w-[1400px]"><PageIntro eyebrow="Catalogue · Products" title="Products" description="Your product catalogue, with stock status and exact shelf location in one view." action={<button onClick={() => { setSelected(undefined); setModal('add'); }} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground shadow-sm transition hover:brightness-95" data-testid="button-add-product"><Plus className="size-4" />Add product</button>} />
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><label className="relative block max-w-md flex-1"><SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter by ID, name, category..." className="w-full rounded-lg border border-border bg-card py-3 pl-10 pr-4 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15" data-testid="input-filter-products" /></label><span className="mono text-xs text-muted-foreground" data-testid="text-product-count">{filtered.length} of {products.length} records</span></div>
    <section className="overflow-hidden rounded-2xl border border-border bg-card soft-shadow"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="border-b border-border bg-muted/60"><tr>{['Product ID', 'Product', 'Category', 'Quantity', 'Location', 'Status', 'Actions'].map((heading) => <th className="px-5 py-3.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground" key={heading}>{heading}</th>)}</tr></thead><tbody className="divide-y divide-border">{filtered.map((product) => <tr className="group transition hover:bg-muted/45" key={product.productId} data-testid={`row-product-${product.productId}`}><td className="px-5 py-4"><span className="mono text-xs font-medium text-muted-foreground">{product.productId}</span></td><td className="px-5 py-4"><button onClick={() => { setSelected(product); setModal('view'); }} className="text-sm font-extrabold hover:text-accent hover:underline" data-testid={`button-view-product-${product.productId}`}>{product.productName}</button></td><td className="px-5 py-4 text-sm text-muted-foreground">{product.category}</td><td className="px-5 py-4"><span className="text-sm font-extrabold">{product.quantity}</span><span className="ml-1 text-xs text-muted-foreground">units</span></td><td className="px-5 py-4"><span className="mono rounded-md bg-muted px-2 py-1 text-[11px]">{product.storageLocation}</span></td><td className="px-5 py-4"><StatusPill status={product.status} /></td><td className="px-5 py-4"><div className="flex gap-1 opacity-70 transition group-hover:opacity-100"><button onClick={() => { setSelected(product); setModal('edit'); }} className="rounded-lg p-2 text-muted-foreground hover:bg-[#d9e9ed] hover:text-[#24545b]" aria-label={`Edit ${product.productName}`} data-testid={`button-edit-product-${product.productId}`}><Pencil className="size-4" /></button><button onClick={() => removeProduct(product)} className="rounded-lg p-2 text-muted-foreground hover:bg-[#f8ded9] hover:text-[#a44139]" aria-label={`Delete ${product.productName}`} data-testid={`button-delete-product-${product.productId}`}><Trash2 className="size-4" /></button></div></td></tr>)}</tbody></table></div>{filtered.length === 0 && <EmptyState icon={Package} title={products.length ? 'No products match' : 'Your catalogue is empty'} detail={products.length ? 'Try a different ID, name, or category.' : 'Add your first product to begin tracking stock.'} />}</section>
    {modal === 'add' && <ProductForm onSave={saveProduct} onClose={() => setModal(null)} />}{modal === 'edit' && selected && <ProductForm initial={selected} onSave={saveProduct} onClose={() => setModal(null)} />}{modal === 'view' && selected && <ProductDetails product={selected} onClose={() => setModal(null)} onEdit={() => setModal('edit')} />}
  </div>;
}

function StorageForm({ initial, onSave, onClose }: { initial?: Storage; onSave: (storage: Storage) => void; onClose: () => void }) {
  const [form, setForm] = useState<Storage>(initial ?? { storageId: `LOC-${String(Math.floor(10 + Math.random() * 89))}`, location: '', capacity: 100, occupiedSpace: 0, availableSpace: 100, status: 'Available' });
  const update = (key: keyof Storage, value: string | number) => setForm((current) => { const next = { ...current, [key]: key === 'capacity' || key === 'occupiedSpace' ? Number(value) : value } as Storage; if (key === 'capacity' || key === 'occupiedSpace') { next.availableSpace = Math.max(0, next.capacity - next.occupiedSpace); next.status = deriveStorageStatus(next.capacity, next.occupiedSpace); } return next; });
  return <Modal eyebrow={initial ? 'Edit location' : 'New location'} title={initial ? 'Update storage' : 'Add storage location'} onClose={onClose}><form onSubmit={(event) => { event.preventDefault(); onSave({ ...form, capacity: Number(form.capacity), occupiedSpace: Number(form.occupiedSpace), availableSpace: Math.max(0, Number(form.capacity) - Number(form.occupiedSpace)), status: deriveStorageStatus(Number(form.capacity), Number(form.occupiedSpace)) }); }}><div className="grid gap-5 sm:grid-cols-2"><Field label="Storage ID" value={form.storageId} onChange={(value) => update('storageId', value)} placeholder="LOC-E01" /><Field label="Location name" value={form.location} onChange={(value) => update('location', value)} placeholder="Aisle E · Shelf 01" /><Field label="Capacity" type="number" value={form.capacity} onChange={(value) => update('capacity', value)} placeholder="100" /><Field label="Occupied space" type="number" value={form.occupiedSpace} onChange={(value) => update('occupiedSpace', value)} placeholder="0" /><div className="rounded-lg bg-muted p-3 text-xs leading-relaxed text-muted-foreground sm:col-span-2"><span className="font-bold text-foreground">Available space: {form.availableSpace}</span><br />Status updates automatically from your capacity and occupied values.</div></div><FormActions onCancel={onClose} label={initial ? 'Save changes' : 'Add location'} /></form></Modal>;
}

function StorageDetails({ storage, onClose, onEdit }: { storage: Storage; onClose: () => void; onEdit: () => void }) {
  const percentage = Math.round((storage.occupiedSpace / storage.capacity) * 100);
  return <Modal eyebrow="Storage record" title={storage.location} onClose={onClose}><div className="rounded-xl bg-muted p-4"><div className="flex items-center justify-between"><StatusPill status={storage.status} /><span className="mono text-xs text-muted-foreground">{storage.storageId}</span></div><div className="mt-5 h-3 overflow-hidden rounded-full bg-card"><div className="h-full rounded-full bg-accent" style={{ width: `${percentage}%` }} /></div><p className="mt-2 text-right text-xs font-bold text-muted-foreground">{percentage}% occupied</p></div><dl className="mt-5 divide-y divide-border">{[['Total capacity', storage.capacity.toString()], ['Occupied space', storage.occupiedSpace.toString()], ['Available space', storage.availableSpace.toString()]].map(([label, value]) => <div className="flex items-center justify-between py-3 text-sm" key={label}><dt className="text-muted-foreground">{label}</dt><dd className="font-bold">{value} spaces</dd></div>)}</dl><div className="mt-5 flex justify-end gap-3"><button onClick={onClose} className="rounded-lg px-4 py-2.5 text-sm font-bold text-muted-foreground hover:bg-muted" data-testid="button-close-storage-details">Close</button><button onClick={onEdit} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground" data-testid="button-edit-from-storage-details"><Pencil className="size-4" />Edit location</button></div></Modal>;
}

function StoragePage() {
  const [storage, setStorage] = useStoredState<Storage[]>('stackline-storage', seedStorage);
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | 'view' | null>(null);
  const [selected, setSelected] = useState<Storage>();
  const filtered = useMemo(() => storage.filter((item) => Object.values(item).some((value) => String(value).toLowerCase().includes(query.toLowerCase()))), [storage, query]);
  const saveStorage = (item: Storage) => { setStorage((items) => items.some((entry) => entry.storageId === item.storageId) ? items.map((entry) => entry.storageId === item.storageId ? item : entry) : [item, ...items]); setModal(null); };
  const removeStorage = (item: Storage) => { if (window.confirm(`Delete ${item.location}? Products may still reference this location.`)) setStorage((items) => items.filter((entry) => entry.storageId !== item.storageId)); };
  return <div className="mx-auto max-w-[1400px]"><PageIntro eyebrow="Warehouse map · Locations" title="Storage locations" description="Keep every shelf, staging zone, and available space accounted for." action={<button onClick={() => { setSelected(undefined); setModal('add'); }} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground shadow-sm transition hover:brightness-95" data-testid="button-add-storage"><Plus className="size-4" />Add location</button>} />
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><label className="relative block max-w-md flex-1"><SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter by ID or location..." className="w-full rounded-lg border border-border bg-card py-3 pl-10 pr-4 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15" data-testid="input-filter-storage" /></label><span className="mono text-xs text-muted-foreground" data-testid="text-storage-count">{filtered.length} of {storage.length} locations</span></div>
    <section className="overflow-hidden rounded-2xl border border-border bg-card soft-shadow"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="border-b border-border bg-muted/60"><tr>{['Storage ID', 'Location', 'Capacity', 'Occupied', 'Available', 'Status', 'Actions'].map((heading) => <th className="px-5 py-3.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground" key={heading}>{heading}</th>)}</tr></thead><tbody className="divide-y divide-border">{filtered.map((item) => <tr className="group transition hover:bg-muted/45" key={item.storageId} data-testid={`row-storage-${item.storageId}`}><td className="px-5 py-4"><span className="mono text-xs font-medium text-muted-foreground">{item.storageId}</span></td><td className="px-5 py-4"><button onClick={() => { setSelected(item); setModal('view'); }} className="text-sm font-extrabold hover:text-accent hover:underline" data-testid={`button-view-storage-${item.storageId}`}>{item.location}</button></td><td className="px-5 py-4 text-sm font-bold">{item.capacity}</td><td className="px-5 py-4 text-sm font-bold">{item.occupiedSpace}</td><td className="px-5 py-4 text-sm font-bold text-accent">{item.availableSpace}</td><td className="px-5 py-4"><StatusPill status={item.status} /></td><td className="px-5 py-4"><div className="flex gap-1 opacity-70 transition group-hover:opacity-100"><button onClick={() => { setSelected(item); setModal('edit'); }} className="rounded-lg p-2 text-muted-foreground hover:bg-[#d9e9ed] hover:text-[#24545b]" aria-label={`Edit ${item.location}`} data-testid={`button-edit-storage-${item.storageId}`}><Pencil className="size-4" /></button><button onClick={() => removeStorage(item)} className="rounded-lg p-2 text-muted-foreground hover:bg-[#f8ded9] hover:text-[#a44139]" aria-label={`Delete ${item.location}`} data-testid={`button-delete-storage-${item.storageId}`}><Trash2 className="size-4" /></button></div></td></tr>)}</tbody></table></div>{filtered.length === 0 && <EmptyState icon={MapPin} title={storage.length ? 'No locations match' : 'No storage locations yet'} detail={storage.length ? 'Try a different storage ID or location name.' : 'Add your first location to map the warehouse.'} />}</section>
    {modal === 'add' && <StorageForm onSave={saveStorage} onClose={() => setModal(null)} />}{modal === 'edit' && selected && <StorageForm initial={selected} onSave={saveStorage} onClose={() => setModal(null)} />}{modal === 'view' && selected && <StorageDetails storage={selected} onClose={() => setModal(null)} onEdit={() => setModal('edit')} />}
  </div>;
}

function SearchPage() {
  const [products] = useStoredState<Product[]>('stackline-products', seedProducts);
  const [storage] = useStoredState<Storage[]>('stackline-storage', seedStorage);
  const [query, setQuery] = useState('');
  const results = useMemo(() => products.filter((product) => [product.productId, product.productName, product.category].some((value) => value.toLowerCase().includes(query.toLowerCase()))), [products, query]);
  return <div className="mx-auto max-w-[1100px]"><PageIntro eyebrow="Find a record" title="Search the warehouse" description="Search by product ID, product name, or category. Start typing and your results will narrow instantly." /><section className="rounded-2xl border border-border bg-card p-5 soft-shadow sm:p-7"><label className="relative block"><SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-accent" /><input autoFocus type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “electronics” or “PRD-1003”" className="w-full rounded-xl border-2 border-input bg-background py-4 pl-12 pr-4 text-base outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10" data-testid="input-search-products" /></label><div className="mt-7 flex items-center justify-between border-b border-border pb-3"><p className="text-sm font-extrabold" data-testid="text-search-results">{query ? `${results.length} result${results.length === 1 ? '' : 's'}` : 'All products'}</p><span className="mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">ID · Name · Category</span></div>{query && results.length === 0 ? <EmptyState icon={SearchIcon} title="No matching products" detail="Try a product ID, a broader category, or check the spelling." /> : <div className="divide-y divide-border">{results.map((product) => <div key={product.productId} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between" data-testid={`search-result-${product.productId}`}><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-[#d9e9ed] text-[#24545b]"><Package className="size-4" /></div><div><p className="text-sm font-extrabold">{product.productName}</p><p className="mono mt-1 text-[10px] text-muted-foreground">{product.productId} · {product.category}</p></div></div><div className="flex items-center gap-5 pl-13 sm:pl-0"><div><p className="text-right text-sm font-extrabold">{product.quantity} <span className="text-xs font-medium text-muted-foreground">units</span></p><p className="mono mt-1 text-right text-[10px] text-muted-foreground">{product.storageLocation}</p></div><StatusPill status={product.status} /></div></div>)}</div>}</section><div className="mt-6 flex items-start gap-3 rounded-xl border border-[#c9dfde] bg-[#e9f3f0] p-4 text-sm text-[#24545b]"><CircleHelp className="mt-0.5 size-4 shrink-0" /><p><span className="font-extrabold">Search tip:</span> Search only covers product fields. There are {storage.length} storage locations available in the Storage view.</p></div></div>;
}

function AboutPage() {
  return <div className="mx-auto max-w-[1100px]"><PageIntro eyebrow="Project notes · Java demo" title="Understand the system" description="Stackline is a small, approachable model of the work a fulfilment team does every day." action={<div className="mono rounded-lg border border-border bg-card px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">v1.0 · college demo</div>} /><div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><section className="rounded-2xl border border-border bg-card p-6 soft-shadow sm:p-8"><div className="flex size-11 items-center justify-center rounded-xl bg-[#d9e9ed] text-[#24545b]"><Database className="size-5" /></div><h2 className="mt-5 text-2xl font-extrabold tracking-tight">A clear data model</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">The frontend mirrors the Java model classes so it is easy to compare the screen with the source code. Each record has a small, purposeful set of fields and each action maps to a familiar CRUD operation.</p><div className="mt-7 grid gap-3 sm:grid-cols-2"><ConceptCard number="01" title="Product" fields="productId · productName · category · quantity · storageLocation · status" icon={Package} /><ConceptCard number="02" title="Storage" fields="storageId · location · capacity · occupiedSpace · availableSpace · status" icon={MapPin} /></div></section><section className="rounded-2xl border border-[#24545b] bg-[#24545b] p-6 text-[#f7f1e5] sm:p-8"><p className="mono text-[10px] uppercase tracking-[0.18em] text-[#b7d0cb]">Java concepts in view</p><div className="mt-6 space-y-5">{[['Classes & objects', 'Product and Storage are the core objects represented in the app.'], ['Encapsulation', 'Fields stay together in a model with clear names and responsibilities.'], ['CRUD methods', 'Add, view, edit, and delete actions demonstrate the basic lifecycle.'], ['Collections', 'The demo treats product and storage records like simple lists.']].map(([title, detail]) => <div className="flex gap-3" key={title}><span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-extrabold text-primary-foreground"><Check className="size-3" /></span><div><p className="text-sm font-extrabold">{title}</p><p className="mt-1 text-xs leading-relaxed text-[#b7d0cb]">{detail}</p></div></div>)}</div></section></div><section className="mt-6 rounded-2xl border border-border bg-card p-6 soft-shadow sm:p-8"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><p className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">How to demonstrate</p><h2 className="mt-2 text-xl font-extrabold">A simple three-minute walkthrough</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">Start on Dashboard, add a product, change its quantity, then search for it. Finish by adding a storage location and checking the capacity status update.</p></div><Link href="/products" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground" data-testid="link-about-start-demo">Start with products <ArrowRight className="size-4" /></Link></div></section></div>;
}

function ConceptCard({ number, title, fields, icon: Icon }: { number: string; title: string; fields: string; icon: typeof Package }) {
  return <div className="rounded-xl border border-border bg-background p-4"><div className="flex items-center justify-between"><span className="mono text-[10px] text-accent">{number}</span><Icon className="size-4 text-muted-foreground" /></div><p className="mt-5 text-sm font-extrabold">{title}</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{fields}</p></div>;
}

function NotFoundPage() {
  const [, setLocation] = useLocation();
  return <div className="mx-auto flex min-h-[70dvh] max-w-lg flex-col items-center justify-center text-center"><div className="flex size-16 items-center justify-center rounded-2xl bg-[#fff0c7] text-[#8b5b09]"><Settings2 className="size-7" /></div><h1 className="mt-6 text-3xl font-extrabold">That aisle is empty.</h1><p className="mt-3 text-sm leading-relaxed text-muted-foreground">The page you’re looking for is not part of this warehouse map.</p><button onClick={() => setLocation('/')} className="mt-6 rounded-lg bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground" data-testid="button-return-dashboard">Return to dashboard</button></div>;
}

function Router() {
  return <Shell><ErrorBoundary resetKey={useLocation()[0]}><Switch><Route path="/" component={Dashboard} /><Route path="/products" component={Products} /><Route path="/storage" component={StoragePage} /><Route path="/search" component={SearchPage} /><Route path="/about" component={AboutPage} /><Route component={NotFoundPage} /></Switch></ErrorBoundary></Shell>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;