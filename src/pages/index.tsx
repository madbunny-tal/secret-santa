import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import supabase from "@/lib/db";
import type { IComm } from "@/types/comm";
import Image from 'next/image';
import Link from "next/link";
import { useEffect, useState } from "react";

const Home = () => {
  const [comm, setComm] = useState<IComm[]>([]);

  useEffect(() =>
  {
    const fetchComm = async () => {
      const {data, error} = await supabase.from('community').select('*');
      
      if (error) {
        console.log("error: ", error);
      }
      else {
        setComm(data);
      }
    }
    fetchComm();
  }, [supabase]);

  console.log(comm);
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Secret Santa</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {
          comm.map((x:IComm) => (
            <Card key={x.comm_id}>
              <CardContent>
                <Image
                  src={'https://mqichvjbjuhwmbtpnklj.storage.supabase.co/v1/object/sign/images/public/20231130_094536.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jZDFkM2YyZS1lNzcwLTQ0Y2MtOWFhMS1lY2ExMzY5YjNhYjMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHVibGljLzIwMjMxMTMwXzA5NDUzNi5qcGciLCJpYXQiOjE3NTE5NTgxNjYsImV4cCI6MTc1NDU1MDE2Nn0.fDqAhI9qwho4nXVJgwgTUoF3hbD3VgNoCwVHWrNZitY'}
                  alt={x.comm_name}
                  width={200}
                  height={200}
                  className="w-full h-[30vh] object-cover rounded-lg"
                 />
                <div className="mt-4 flex justify-between">
                  <div>
                    <h4 className="font-semibold text-xl">{x.comm_name}</h4>
                    <p>public community</p>
                  </div>
                  <p className="font-semibold text-2xl">10</p>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/member/${x.comm_id}`} className="w-full" >
                  <Button className="w-full  font-bold" size="lg">Open</Button>
                </Link>
              </CardFooter>
            </Card> 
          ))
        }
      </div>
    </div>
  );

};

export default Home;