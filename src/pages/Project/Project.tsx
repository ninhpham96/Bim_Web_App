import { Card, Tooltip } from "flowbite-react"
import { Link } from "react-router-dom";

const revit = "/Revit.png";
const ifc = "/IFC.png";

export interface IPlatform {
  src: string;
  tooltip: string;
  path: string;
}
const platforms: IPlatform[] = [
  {
    src: revit,
    tooltip: "Open Revit",
    path: "/viewer?file_type=revit"
  },
  {
    src: ifc,
    tooltip: "Open IFC",
    path: "/viewer?file_type=ifc"
  }
]
const Project = () => {
  return (
    <div className="relative h-full w-full flex justify-center items-center">
      <div className="flex">
        {platforms.map((platform, index) => (
          <Card key={index} className="mx-2">
            <Tooltip placement="top" content={platform.tooltip}>
              <div className="relative h-[250px] w-[250px] flex justify-center items-center">
                <Link to={platform.path}>
                  <img src={platform.src} alt={platform.tooltip} />
                </Link>
              </div>
            </Tooltip>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Project
