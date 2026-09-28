import {useNavigate} from "react-router-dom";

interface PageNameProps {
    mode: string;
}

export default function  PageName( { mode }: PageNameProps ) {

    const navigate = useNavigate();

    return (
        <h1
            onClick={() => navigate('/')}
            className="text-lg font-bold text-white cursor-pointer hover:text-neutral-300"
        >
            Vexle <span className="text-xs font-normal text-neutral-500 ml-2 uppercase tracking-wide border border-[#333] bg-[#222] px-2 py-0.5 rounded">{mode}</span>
        </h1>
    )
}