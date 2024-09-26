import { Skeleton } from "../ui/skeleton";

const InventoryLoading = () => {
  return (
    <>
      <main className="grid grdi-cols-1 md:grid-cols-2 mb-6 gap-6 w-full">
        <Skeleton className="h-[280px]" />
        <Skeleton className="h-[280px]" />
        <Skeleton className="h-[400px] col-span-2" />
      </main>
    </>
  );
};

export default InventoryLoading;
