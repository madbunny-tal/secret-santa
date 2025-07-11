import supabase from "@/lib/db";
import { IMember } from "@/types/member";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from 'next/image';
import { Button } from "@/components/ui/button";

const Member = () => {
    const router = useRouter();
    const [mem, setMem] = useState<IMember|null>(null);

    useEffect(() => {
        const fetchMember = async () => {
            if (router.query.id) {
                const {data, error} = await supabase
                    .from('member')
                    .select('mem_id, mem_name, mem_comm')
                    .eq('mem_id',router.query.id)
                    .single();
                if (error)
                    console.log(error)
                else
                    setMem(data);
            }
        };
        fetchMember();
    }, [router.query.id]);
    return (
        <div className="container mx-auto py-8">
            <div className="flex gap-16">
                {
                    mem &&
                    <div className="flex gap-16 items-center w-full">
                        <div className="w-1/2">
                            <Image
                                src={'https://mqichvjbjuhwmbtpnklj.storage.supabase.co/v1/object/sign/images/public/20231130_094536.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jZDFkM2YyZS1lNzcwLTQ0Y2MtOWFhMS1lY2ExMzY5YjNhYjMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHVibGljLzIwMjMxMTMwXzA5NDUzNi5qcGciLCJpYXQiOjE3NTE5NTgxNjYsImV4cCI6MTc1NDU1MDE2Nn0.fDqAhI9qwho4nXVJgwgTUoF3hbD3VgNoCwVHWrNZitY'}
                                alt={mem.mem_name}
                                width="1080"
                                height="1080"
                                className="w-full h-[70vh] object-cover rounded-2xl"
                            />
                        </div>
                        <div className="w-1/2">
                            <h1 className="text-5xl font-bold mb-4">{mem.mem_name}</h1>
                            <p className="text-xl mb-4 text-neutral 500">lorem ipsum dolor sit amet</p>
                            <div className="text-4xl font-bold">reference submitted</div>
                            <Button className="text-lg py-6 font-bold" size="lg">Upload</Button>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}
export default Member;