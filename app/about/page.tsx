import Image from "next/image";

export default function AboutDepartment() {
  return (
    <div className="flex flex-col items-center mt-8 bg-background min-h-screen">
      <div className="rounded-2xl shadow-2xl p-4 flex items-center justify-center bg-[#232323] dark:bg-[#232323]">
        <img src="/cabssa-logo.png" alt="CABSSA Logo" width={350} height={250} style={{ display: 'block' }} />
      </div>
      <div className="max-w-2xl mt-6 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">About the Department</h1>
        <p className="text-muted-foreground">
          Welcome to the Computer Science and Business Systems (CSBS) Department at KIT College of Engineering, Kolhapur. Our department is dedicated to providing a blend of computer science fundamentals and business system knowledge, empowering students for the modern tech-driven business world.
        </p>
      </div>
    </div>
  );
} 