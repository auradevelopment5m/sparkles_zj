import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductForm } from "@/components/admin/product-form"

export default function NewProductPage() {
  return (
    <div className="p-4 lg:p-8">
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href="/admin/products">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <p className="text-muted-foreground">Create a new canvas for your store</p>
      </div>

      <ProductForm />
    </div>
  )
}
