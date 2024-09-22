# Diff Details

Date : 2024-09-16 20:03:25

Directory /Users/divnoor/work-based-projects/Zippex/Zippex-merchant-app/zippex-merchant

Total : 45 files,  3642 codes, 126 comments, 340 blanks, all 4108 lines

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [next.config.mjs](/next.config.mjs) | JavaScript | 4 | 0 | 0 | 4 |
| [package-lock.json](/package-lock.json) | JSON | 260 | 0 | 0 | 260 |
| [package.json](/package.json) | JSON | 6 | 0 | 0 | 6 |
| [src/app/constants/index.tsx](/src/app/constants/index.tsx) | TypeScript JSX | -78 | 0 | -3 | -81 |
| [src/app/dashboard/customer-management/page.tsx](/src/app/dashboard/customer-management/page.tsx) | TypeScript JSX | 97 | 3 | 19 | 119 |
| [src/app/dashboard/home/page.tsx](/src/app/dashboard/home/page.tsx) | TypeScript JSX | -1 | -1 | 0 | -2 |
| [src/app/dashboard/inventory/add-product/page.tsx](/src/app/dashboard/inventory/add-product/page.tsx) | TypeScript JSX | 9 | 0 | 3 | 12 |
| [src/app/dashboard/inventory/all-products/page.tsx](/src/app/dashboard/inventory/all-products/page.tsx) | TypeScript JSX | 65 | 18 | 12 | 95 |
| [src/app/dashboard/inventory/edit-product/page.tsx](/src/app/dashboard/inventory/edit-product/page.tsx) | TypeScript JSX | 5 | 0 | 3 | 8 |
| [src/app/dashboard/inventory/page.tsx](/src/app/dashboard/inventory/page.tsx) | TypeScript JSX | 166 | 9 | 17 | 192 |
| [src/app/dashboard/inventory/product/[productId]/page.tsx](/src/app/dashboard/inventory/product/%5BproductId%5D/page.tsx) | TypeScript JSX | 5 | 0 | 3 | 8 |
| [src/app/dashboard/layout.tsx](/src/app/dashboard/layout.tsx) | TypeScript JSX | 5 | 0 | 1 | 6 |
| [src/app/dashboard/orders/page.tsx](/src/app/dashboard/orders/page.tsx) | TypeScript JSX | 259 | 5 | 30 | 294 |
| [src/app/dashboard/promotions-discounts/page.tsx](/src/app/dashboard/promotions-discounts/page.tsx) | TypeScript JSX | 24 | 1 | 5 | 30 |
| [src/app/globals.css](/src/app/globals.css) | PostCSS | 1 | 0 | 0 | 1 |
| [src/components/UploadButton.tsx](/src/components/UploadButton.tsx) | TypeScript JSX | -2 | 0 | 1 | -1 |
| [src/components/dashboard/ColumnDef.tsx](/src/components/dashboard/ColumnDef.tsx) | TypeScript JSX | 433 | 22 | 33 | 488 |
| [src/components/dashboard/DataTable.tsx](/src/components/dashboard/DataTable.tsx) | TypeScript JSX | -198 | -24 | -14 | -236 |
| [src/components/dashboard/TotalOrders.tsx](/src/components/dashboard/TotalOrders.tsx) | TypeScript JSX | -143 | -1 | -14 | -158 |
| [src/components/dashboard/customer-management/CustomerManagementTable.tsx](/src/components/dashboard/customer-management/CustomerManagementTable.tsx) | TypeScript JSX | 157 | 2 | 9 | 168 |
| [src/components/dashboard/inventory/InventoryOverview.tsx](/src/components/dashboard/inventory/InventoryOverview.tsx) | TypeScript JSX | 169 | 3 | 10 | 182 |
| [src/components/dashboard/inventory/LowStockGraph.tsx](/src/components/dashboard/inventory/LowStockGraph.tsx) | TypeScript JSX | 57 | 0 | 7 | 64 |
| [src/components/dashboard/inventory/MostOrderedGraph.tsx](/src/components/dashboard/inventory/MostOrderedGraph.tsx) | TypeScript JSX | 57 | 0 | 7 | 64 |
| [src/components/dashboard/inventory/add-product/UploadProductImage.tsx](/src/components/dashboard/inventory/add-product/UploadProductImage.tsx) | TypeScript JSX | 104 | 3 | 11 | 118 |
| [src/components/dashboard/inventory/all-products/AllProductsTable.tsx](/src/components/dashboard/inventory/all-products/AllProductsTable.tsx) | TypeScript JSX | 216 | 7 | 17 | 240 |
| [src/components/dashboard/inventory/product/ProductDetails.tsx](/src/components/dashboard/inventory/product/ProductDetails.tsx) | TypeScript JSX | 193 | 12 | 13 | 218 |
| [src/components/dashboard/orders/DataTable.tsx](/src/components/dashboard/orders/DataTable.tsx) | TypeScript JSX | 198 | 24 | 14 | 236 |
| [src/components/dashboard/orders/OrderDetails.tsx](/src/components/dashboard/orders/OrderDetails.tsx) | TypeScript JSX | 243 | 7 | 31 | 281 |
| [src/components/dashboard/orders/OrderHistoryTable.tsx](/src/components/dashboard/orders/OrderHistoryTable.tsx) | TypeScript JSX | 207 | 4 | 12 | 223 |
| [src/components/dashboard/orders/TotalOrders.tsx](/src/components/dashboard/orders/TotalOrders.tsx) | TypeScript JSX | 141 | 1 | 14 | 156 |
| [src/components/dashboard/promotions-discounts/AllDiscountsTable.tsx](/src/components/dashboard/promotions-discounts/AllDiscountsTable.tsx) | TypeScript JSX | 4 | 0 | 2 | 6 |
| [src/components/forms/AddProductForm.tsx](/src/components/forms/AddProductForm.tsx) | TypeScript JSX | 308 | 12 | 23 | 343 |
| [src/components/forms/EditProductForm.tsx](/src/components/forms/EditProductForm.tsx) | TypeScript JSX | 306 | 16 | 30 | 352 |
| [src/components/shared/Pagination.tsx](/src/components/shared/Pagination.tsx) | TypeScript JSX | -4 | 0 | 0 | -4 |
| [src/components/shared/Topbar.tsx](/src/components/shared/Topbar.tsx) | TypeScript JSX | 1 | 0 | 0 | 1 |
| [src/components/ui/alert-dialog.tsx](/src/components/ui/alert-dialog.tsx) | TypeScript JSX | 127 | 0 | 15 | 142 |
| [src/components/ui/badge.tsx](/src/components/ui/badge.tsx) | TypeScript JSX | 2 | 0 | 0 | 2 |
| [src/components/ui/button.tsx](/src/components/ui/button.tsx) | TypeScript JSX | -1 | 0 | 0 | -1 |
| [src/components/ui/pagination.tsx](/src/components/ui/pagination.tsx) | TypeScript JSX | 111 | 0 | 11 | 122 |
| [src/components/ui/separator.tsx](/src/components/ui/separator.tsx) | TypeScript JSX | 27 | 0 | 5 | 32 |
| [src/constants/index.tsx](/src/constants/index.tsx) | TypeScript JSX | 73 | 0 | 3 | 76 |
| [src/lib/actions/product.actions.ts](/src/lib/actions/product.actions.ts) | TypeScript | 26 | 3 | 8 | 37 |
| [src/lib/utils.ts](/src/lib/utils.ts) | TypeScript | 1 | 0 | 0 | 1 |
| [todo.js](/todo.js) | JavaScript | 0 | 0 | 1 | 1 |
| [tsconfig.json](/tsconfig.json) | JSON with Comments | 2 | 0 | 1 | 3 |

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details