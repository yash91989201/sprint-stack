[complex-form.md#79D2]
1:# Complex / Nested Form Boilerplate
2:
3:For nested objects, dynamic arrays, and multi-section forms.
4:
5:## Schema with Nested Structures
6:
7:```ts
8:const schema = z.object({
9:  name: z.string().min(1),
10:  notifications: z.object({
11:    email: z.boolean(),
12:    sms: z.boolean(),
13:  }),
14:  users: z.array(z.object({
15:    email: z.email(),
16:  })).min(1).max(5),
17:});
18:```
19:
20:## Dynamic Arrays (useFieldArray pattern)
21:
22:Use `form.Field` with `mode="array"` for dynamic lists:
23:
24:```tsx
25:<form.Field mode="array" name="users">
26:  {(field) => (
27:    <div>
28:      <Button
29:        type="button"
30:        onClick={() => field.pushValue({ email: "" })}
31:      >
32:        Add User
33:      </Button>
34:
35:      {field.state.value.map((_, index) => (
36:        <form.Field key={index} name={`users[${index}].email`}>
37:          {(innerField) => (
38:            <div>
39:              <field.Input
40:                label={`User ${index + 1} Email`}
41:              />
42:              <Button
43:                type="button"
44:                onClick={() => field.removeValue(index)}
45:              >
46:                Remove
47:              </Button>
48:            </div>
49:          )}
50:        </form.Field>
51:      ))}
52:    </div>
53:  )}
54:</form.Field>
55:```
56:
57:Always use `field.pushValue()` and `field.removeValue()` for array operations. No `useFormContext` needed — TanStack Form automatically provides context to nested fields via `form.AppField`.
58:
59:## Nested Field Naming
60:
61:Use dot notation: `"notifications.email"`, `"users[0].email"`.
62:
63:## Full Boilerplate
64:
65:```tsx
66:import { IconX } from "@tabler/icons-react";
67:import { z } from "zod";
68:import { useMutation } from "@tanstack/react-query";
69:import { Button } from "@sprint-stack/ui/components/button";
70:import {
71:  Field,
72:  FieldContent,
73:  FieldDescription,
74:  FieldError,
75:  FieldGroup,
76:  FieldLegend,
77:  FieldSet,
78:} from "@sprint-stack/ui/components/field";
79:import { useAppForm } from "@sprint-stack/ui/components/form/hooks";
80:import {
81:  InputGroup,
82:  InputGroupAddon,
83:  InputGroupButton,
84:  InputGroupInput,
85:} from "@sprint-stack/ui/components/input-group";
86:import { SelectItem } from "@sprint-stack/ui/components/select";
87:import { Spinner } from "@sprint-stack/ui/components/spinner";
88:import { queryUtils } from "@/utils/orpc";
89:
90:export const PROJECT_STATUSES = ["draft", "active", "finished"] as const;
91:
92:export const ProjectFormSchema = z.object({
93:  name: z.string().min(1),
94:  status: z.enum(PROJECT_STATUSES),
95:  description: z.string().transform((v) => v || undefined),
96:  notifications: z.object({
97:    email: z.boolean(),
98:    sms: z.boolean(),
99:    push: z.boolean(),
100:  }),
101:  users: z
102:    .array(z.object({ email: z.email() }))
103:    .min(1, "At least one user is required")
104:    .max(5, "Maximum 5 users allowed"),
105:});
106:
107:type ProjectFormType = z.infer<typeof ProjectFormSchema>;
108:
109:export function ProjectForm() {
110:  const { mutateAsync: createProject } = useMutation(
111:    queryUtils.project.create.mutationOptions({
112:      onSuccess: () => {
113:        toast.success("Project created successfully");
114:        form.reset();
115:      },
116:    })
117:  );
118:
119:  const form = useAppForm({
120:    defaultValues: {
121:      name: "",
122:      description: "",
123:      users: [{ email: "" }],
124:      status: "draft",
125:      notifications: {
126:        email: false,
127:        sms: false,
128:        push: false,
129:      },
130:    } satisfies ProjectFormType as ProjectFormType,
131:    validators: {
132:      onSubmit: ProjectFormSchema,
133:    },
134:    onSubmit: async ({ value }) => {
135:      await createProject(value);
136:    },
137:  });
138:
139:  return (
140:    <form.AppForm>
141:      <form
142:        className="space-y-4"
143:        onSubmit={(e) => {
144:          e.preventDefault();
145:          form.handleSubmit();
146:        }}
147:      >
148:        <FieldGroup>
149:          {/* Simple text input */}
150:          <form.AppField name="name">
151:            {(field) => <field.Input label="Project Name" />}
152:          </form.AppField>
153:
154:          {/* Select dropdown */}
155:          <form.AppField name="status">
156:            {(field) => (
157:              <field.Select label="Status">
158:                {PROJECT_STATUSES.map((status) => (
159:                  <SelectItem key={status} value={status}>
160:                    {status}
161:                  </SelectItem>
162:                ))}
163:              </field.Select>
164:            )}
165:          </form.AppField>
166:
167:          {/* Textarea */}
168:          <form.AppField name="description">
169:            {(field) => (
170:              <field.Textarea
171:                description="Be as detailed as possible"
172:                label="Description"
173:              />
174:            )}
175:          </form.AppField>
176:
177:          {/* Nested object fields (checkboxes) */}
178:          <FieldSet>
179:            <FieldContent>
180:              <FieldLegend>Notifications</FieldLegend>
181:              <FieldDescription>
182:                Select how you would like to receive notifications.
183:              </FieldDescription>
184:            </FieldContent>
185:            <FieldGroup data-slot="checkbox-group">
186:              <form.AppField name="notifications.email">
187:                {(field) => <field.Checkbox label="Email" />}
188:              </form.AppField>
189:              <form.AppField name="notifications.sms">
190:                {(field) => <field.Checkbox label="Text" />}
191:              </form.AppField>
192:              <form.AppField name="notifications.push">
193:                {(field) => <field.Checkbox label="In App" />}
194:              </form.AppField>
195:            </FieldGroup>
196:          </FieldSet>
197:
198:          {/* Dynamic array fields */}
199:          <form.Field mode="array" name="users">
200:            {(field) => (
201:              <FieldSet>
202:                <div className="flex items-center justify-between gap-2">
203:                  <FieldContent>
204:                    <FieldLegend className="mb-0" variant="label">
205:                      User Email Addresses
206:                    </FieldLegend>
207:                    <FieldDescription>
208:                      Add up to 5 users to this project (including yourself).
209:                    </FieldDescription>
210:                    {field.state.meta.errors && (
211:                      <FieldError errors={field.state.meta.errors} />
212:                    )}
213:                  </FieldContent>
214:                  <Button
215:                    onClick={() => field.pushValue({ email: "" })}
216:                    size="sm"
217:                    type="button"
218:                    variant="outline"
219:                  >
220:                    Add User
221:                  </Button>
222:                </div>
223:                <FieldGroup>
224:                  {field.state.value.map((_, index) => (
225:                    <form.Field
226:                      key={index.toString()}
227:                      name={`users[${index}].email`}
228:                    >
229:                      {(innerField) => {
230:                        const isInvalid =
231:                          innerField.state.meta.isTouched &&
232:                          !innerField.state.meta.isValid;
233:                        return (
234:                          <Field
235:                            data-invalid={isInvalid}
236:                            orientation="horizontal"
237:                          >
238:                            <FieldContent>
239:                              <InputGroup>
240:                                <InputGroupInput
241:                                  aria-invalid={isInvalid}
242:                                  aria-label={`User ${index + 1} email`}
243:                                  id={innerField.name}
244:                                  onBlur={innerField.handleBlur}
245:                                  onChange={(e) =>
246:                                    innerField.handleChange(e.target.value)
247:                                  }
248:                                  type="email"
249:                                  value={innerField.state.value}
250:                                />
251:                                {field.state.value.length > 1 && (
252:                                  <InputGroupAddon align="inline-end">
253:                                    <InputGroupButton
254:                                      aria-label={`Remove User ${index + 1}`}
255:                                      onClick={() => field.removeValue(index)}
256:                                      size="icon-xs"
257:                                      type="button"
258:                                      variant="ghost"
259:                                    >
260:                                      <IconX />
261:                                    </InputGroupButton>
262:                                  </InputGroupAddon>
263:                                )}
264:                              </InputGroup>
265:                              {isInvalid && (
266:                                <FieldError
267:                                  errors={innerField.state.meta.errors}
268:                                />
269:                              )}
270:                            </FieldContent>
271:                          </Field>
272:                        );
273:                      }}
274:                    </form.Field>
275:                  ))}
276:                </FieldGroup>
277:              </FieldSet>
278:            )}
279:          </form.Field>
280:
281:          {/* Submit button with loading state */}
282:          <form.Subscribe
283:            selector={(state) => [
284:              state.canSubmit,
285:              state.isValidating,
286:              state.isSubmitting,
287:            ]}
288:          >
289:            {([canSubmit, isValidating, isSubmitting]) => (
290:              <Button
291:                disabled={!canSubmit || isValidating || isSubmitting}
292:                type="submit"
293:              >
294:                {isSubmitting ? (
295:                  <>
296:                    <Spinner />
297:                    Creating...
298:                  </>
299:                ) : (
300:                  "Create Project"
…
309:}
310:```
311:
…
356:```

[Showing lines 1-300 of 357. Use :301 to continue]