"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { auth } from "@/lib/firebase";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";

const ProfileDropdown = () => {
  const user = auth.currentUser;
  const router = useRouter();
  // console.log(user);

  // console.log(user?.uid);

  //   const docRef = doc(db, "users", user!.uid);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="rounded-full" size={"icon"}>
            <User className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user!.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Edit Profile</DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default ProfileDropdown;
