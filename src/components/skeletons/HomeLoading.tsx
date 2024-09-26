import { Skeleton } from "../ui/skeleton";

const HomeLoading = () => {
  return (
    <main className="grid md:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-4 max-md:mb-6">
      <Skeleton className="w-full h-[175px] rounded-xl" />
      <Skeleton className="w-full h-[175px] rounded-xl" />
      <Skeleton className="w-full h-[175px] rounded-xl" />
      <Skeleton className="w-full h-[175px] rounded-xl" />

      <Skeleton className="w-full h-[430px] rounded-xl col-span-2" />
      <Skeleton className="w-full h-[430px] rounded-xl col-span-2" />
    </main>
  );
};

export default HomeLoading;
