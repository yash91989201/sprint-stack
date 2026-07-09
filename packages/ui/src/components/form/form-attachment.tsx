import {
	Attachment,
	AttachmentContent,
	AttachmentGroup,
	AttachmentTitle,
	AttachmentTrigger,
} from "@sprint-stack/ui/components/attachment";
import {
	type ChangeEvent,
	type ComponentProps,
	type ReactNode,
	useCallback,
	useRef,
} from "react";
import { FormBase, type FormControlProps } from "./form-base";
import { useFieldContext } from "./hooks";

type FormAttachmentProps = FormControlProps &
	Pick<ComponentProps<"input">, "accept" | "capture" | "multiple"> & {
		children?: ReactNode;
	};

export function FormAttachment({
	children,
	accept,
	capture,
	multiple,
	...props
}: FormAttachmentProps) {
	const field = useFieldContext<File[]>();
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
	const inputRef = useRef<HTMLInputElement>(null);

	const handleBlur = useCallback(() => {
		field.handleBlur();
	}, [field]);

	const handleClick = useCallback(() => {
		inputRef.current?.click();
	}, []);

	const handleChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const files = Array.from(event.target.files ?? []);
			field.handleChange(multiple ? [...field.state.value, ...files] : files);
			event.target.value = "";
		},
		[field, multiple]
	);

	return (
		<FormBase {...props}>
			<AttachmentGroup>
				{children}
				<Attachment state="idle">
					<AttachmentTrigger
						aria-invalid={isInvalid}
						id={field.name}
						onBlur={handleBlur}
						onClick={handleClick}
					/>
					<AttachmentContent>
						<AttachmentTitle>
							{multiple === true ? "Upload files" : "Upload file"}
						</AttachmentTitle>
					</AttachmentContent>
					<input
						accept={accept}
						aria-hidden="true"
						capture={capture}
						className="sr-only"
						multiple={multiple}
						name={field.name}
						onChange={handleChange}
						ref={inputRef}
						tabIndex={-1}
						type="file"
					/>
				</Attachment>
			</AttachmentGroup>
		</FormBase>
	);
}
