export default function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      {/* Include shared UI here e.g. a header or sidebar */}
      <nav className="flex flex-row gap-4">
        <ul className="li">Hey</ul>
        <ul className="li">Menu1</ul>
        <ul className="li">Menu2</ul>
        <ul className="li">Menu3</ul>
        <ul className="li">Menu4</ul>
      </nav>

      {children}
    </section>
  );
}
