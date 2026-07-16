import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import SiteRuntimeSettings from "@/components/site-runtime-settings";

export const metadata: Metadata = {
  title:{default:"Dromocob | Film, Web & Growth",template:"%s | Dromocob"},
  description:"Sinematik prodüksiyon, modern web ürünleri ve büyüme odaklı dijital sistemler.",
  metadataBase:new URL("https://dromocob.com"),
  keywords:["kurumsal web sitesi","video prodüksiyon","dijital büyüme","istanbul yazılım"],
  openGraph:{
    title:"Dromocob | Film, Web & Growth",
    description:"Sinematik prodüksiyon, modern web ürünleri ve büyüme odaklı dijital sistemler.",
    url:"https://dromocob.com",
    siteName:"Dromocob",
    locale:"tr_TR",
    type:"website"
  },
  twitter:{
    card:"summary_large_image",
    title:"Dromocob | Film, Web & Growth",
    description:"Sinematik prodüksiyon, modern web ürünleri ve büyüme odaklı dijital sistemler."
  },
  robots:{
    index:true,
    follow:true
  }
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html
  lang="tr"
  data-scroll-behavior="smooth"
><body><AuthProvider><SiteRuntimeSettings>{children}</SiteRuntimeSettings></AuthProvider></body></html>;
}
