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
import { signOut } from "firebase/auth";

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
          <DropdownMenuItem
            onClick={() => router.push("/dashboard/settings")}
            className="hover:cursor-pointer"
          >
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => signOut(auth).then(() => router.push("/sign-in"))}
            className="hover:cursor-pointer"
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default ProfileDropdown;
