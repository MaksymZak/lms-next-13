"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CourseEnrollButtonProps {
  price: number;
  courseId: string;
}

export const CourseEnrollButton = ({
  price,
  courseId,
}: CourseEnrollButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isFree = !price;

  const onClick = async () => {
    try {
      setIsLoading(true);

      const response = await axios.post(`/api/courses/${courseId}/checkout`);

      window.location.assign(response.data.url);
    } catch {
      toast.error("Something went wrong");
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return null;
  }

  if (isFree) {
    return (
      <Button
        onClick={onClick}
        disabled={isLoading}
        size="sm"
        className="w-full md:w-auto"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Enroll for free
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" className="w-full md:w-auto">
          Enroll for {formatPrice(price)}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="mb-3 text-center text-sm">
          Test credit card is <br />
          4242-4242-4242-4242
        </p>

        <Button
          onClick={onClick}
          disabled={isLoading}
          size="sm"
          className="mx-auto block w-auto"
        >
          {isLoading ? (
            <Loader2 className="mx-auto h-4 w-4 animate-spin" />
          ) : (
            <>Enroll for {formatPrice(price)}</>
          )}
        </Button>
      </PopoverContent>
    </Popover>
  );
};
