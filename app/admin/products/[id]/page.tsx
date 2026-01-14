import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductForm } from "@/components/admin/product-form"
import { createClient } from "@/lib/supabase/server"

async function getProduct(id: string) {
  const supabase = await createClient()
  const { data } = await supabase.from("products").select("*, images:product_images(*)").eq("id", id).single()
  return data
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  return (
    <div className="p-4 lg:p-8">
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href="/admin/products">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-muted-foreground">Update {product.name}</p>
      </div>

      <ProductForm product={product} />
    </div>
  )
}
