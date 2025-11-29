const Page = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="flex flex-col items-center px-0 md:px-40">
      {children}
    </section>
  )
}

export default Page
