import { IconStore } from "@/utils/helperFunctions/iconStore";
import Button from "../button";

const DeleteConfirmation = ({
  content = "",
  handleDelete,
  handleClose,
  loader,
}) => {
    return (
          <div
        className="bg-black/75 h-dvh w-dvw flex  justify-center items-center fixed top-0 left-0 z-[999]"
      // onClick={handleClose}
                  >
                    <div
        className={`bg-white absolute flex max-md:flex-col max-md:gap-3 w-[300px]  rounded-sm justify-between p-2 items-center md:w-[500px]`}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[#231F20] font-medium max-w-[330px] text-[14px] text-center">
                      {content}
                    </p>
        <div className="flex gap-4">
          <Button
            type="secondary"
            label="Cancel"
            classNames={{
              root: "py-[4px] justify-center",
              label_: "text-[12px] px-[2]",
            }}
            onClick={handleClose}
          />
          <Button
            type="primary"
            label="Delete"
            loading={loader}
            classNames={{
              root: "py-[4px] justify-center",
              label_: "text-[12px] px-[10px]",
            }}
            onClick={handleDelete}
          />
        </div>
      </div>
</div>
  );
};

export default DeleteConfirmation;
