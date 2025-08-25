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
        className={`bg-white absolute flex flex-col gap-4 w-[400px]  rounded-lg justify-between p-6 items-center md:w-[600px]  shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[#231F20] font-medium max-w-[450px] text-[16px] md:text-[18px] text-center leading-relaxed">
                      {content}
                    </p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <Button
            type="secondary"
            label="Cancel"
            classNames={{
              root: "py-[8px] px-[16px] justify-center min-w-[100px]",
              label_: "text-[14px] md:text-[16px]",
            }}
            onClick={handleClose}
          />
          <Button
            type="primary"
            label="Delete"
            loading={loader}
            classNames={{
              root: "py-[8px] px-[16px] justify-center min-w-[100px]",
              label_: "text-[14px] md:text-[16px]",
            }}
            onClick={handleDelete}
          />
        </div>
      </div>
</div>
  );
};

export default DeleteConfirmation;