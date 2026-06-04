import Topbar from "@/components/layout/Topbar"
import Footer from "@/components/layout/Footer"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <Topbar />
      <div className="content">
        <div className="content__inner">{children}</div>
      </div>
      <Footer />
    </div>
  )
}
