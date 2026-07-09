import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { FormAttachment } from "./form-attachment";
import { FormCheckbox } from "./form-checkbox";
import { FormInput } from "./form-input";
import {
	FormInputGroup,
	FormInputGroupInput,
	FormInputGroupSpinner,
	FormInputGroupTextarea,
} from "./form-input-group";
import { FormSelect } from "./form-select";
import { FormTextarea } from "./form-textarea";

const { fieldContext, formContext, useFieldContext, useFormContext } =
	createFormHookContexts();

const { useAppForm, withForm, withFieldGroup } = createFormHook({
	fieldComponents: {
		Attachment: FormAttachment,
		Checkbox: FormCheckbox,
		Input: FormInput,
		InputGroup: FormInputGroup,
		InputGroupInput: FormInputGroupInput,
		InputGroupSpinner: FormInputGroupSpinner,
		InputGroupTextarea: FormInputGroupTextarea,
		Select: FormSelect,
		Textarea: FormTextarea,
	},
	fieldContext,
	formComponents: {},
	formContext,
});

export {
	useAppForm,
	useFieldContext,
	useFormContext,
	withFieldGroup,
	withForm,
};
