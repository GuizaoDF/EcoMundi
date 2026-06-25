interface Props {
    title: string;
    description?: string;
  }
  
  export default function PageTitle({
    title,
    description,
  }: Props) {
    return (
      <div className="mb-10">
  
        <h1 className="text-4xl font-serif text-[#102419]">
          {title}
        </h1>
  
        {description && (
          <p className="text-gray-500 mt-2">
            {description}
          </p>
        )}
  
      </div>
    );
  }