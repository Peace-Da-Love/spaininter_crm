import { FC, useEffect, useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { twMerge } from 'tailwind-merge';
import ExpandArrow from '@/assets/icons/ic_expand_arrow.svg?react';
import Chat from '@/assets/icons/ic_chat.svg?react';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/hooks';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { pxToRem } from '@/shared/css-utils';
import { useMediaQuery } from '@mui/material';
import { citiesModel } from '@/widgets/cities/model';

interface Props {
  tag?: keyof JSX.IntrinsicElements;
  className?: string;
  cardInfo: {
    id: number;
    imageUrl: string;
    title: string;
    links: { text: string; link: string }[];
  };
}

const linkSchema = z.object({
  name: z.string().min(1, 'Link name is required'),
  url: z.string().url('Invalid URL'),
});

const photoSchema = z.object({
  photo: z.any().refine(file => file instanceof File, 'Photo is required'),
});

export const CityCard: FC<Props> = ({ tag = 'div', className, cardInfo: { id, imageUrl, links, title } }) => {
  const [isLinksOpen, setIsLinksOpen] = useState<boolean>(false);
  const [isAddLinkOpen, setIsAddLinkOpen] = useState<boolean>(false);
  const [isChangePhotoOpen, setIsChangePhotoOpen] = useState<boolean>(false);
  const [downAnimation, setDownAnimation] = useState<boolean>(false);
  const isDesktop = useMediaQuery('(min-width: 950px)');
  const queryClient = useQueryClient();
  const toast = useToast();

  const { register: registerLink, handleSubmit: handleSubmitLink, reset: resetLink, formState: { errors: linkErrors } } = useForm<z.infer<typeof linkSchema>>({
    resolver: zodResolver(linkSchema),
  });

  const { register: registerPhoto, handleSubmit: handleSubmitPhoto, reset: resetPhoto, formState: { errors: photoErrors } } = useForm<z.infer<typeof photoSchema>>({
    resolver: zodResolver(photoSchema),
  });

  const { mutate: addLink, isPending: isLinkPending } = useMutation({
    mutationFn: (data: { name: string; url: string }) =>
      citiesModel.addLink({ ...data, cityId: id.toString() }),
    onSuccess: () => {
      setIsAddLinkOpen(false);
      toast.success('Link added successfully');
      resetLink();
      queryClient.invalidateQueries({ queryKey: ['get-cities-key'] });
    },
    onError: () => toast.error('Failed to add link'),
  });

  const { mutate: changePhoto, isPending: isPhotoPending } = useMutation({
    mutationFn: (data: FormData) => citiesModel.updatePhoto(id.toString(), data),
    onSuccess: () => {
      setIsChangePhotoOpen(false);
      toast.success('Photo updated successfully');
      resetPhoto();
      queryClient.invalidateQueries({ queryKey: ['get-cities-key'] });
    },
    onError: () => toast.error('Failed to update photo'),
  });

  useEffect(() => {
    if (isLinksOpen) {
      setTimeout(() => setDownAnimation(true), 1);
    } else {
      setDownAnimation(false);
    }
  }, [isLinksOpen]);

  const Tag = tag;

  const onSubmitLink: SubmitHandler<z.infer<typeof linkSchema>> = data => {
    addLink(data);
  };

  const onSubmitPhoto: SubmitHandler<z.infer<typeof photoSchema>> = data => {
    const formData = new FormData();
    formData.append('photo', data.photo[0]);
    changePhoto(formData);
  };

  return (
    <>
      <Tag
        className={twMerge(
          `rounded-[25px] overflow-hidden ${isLinksOpen ? 'z-[2]' : ''} ${className}`
        )}
      >
        {isDesktop ? (
          <div>
            <div className="w-full relative">
              <div className="flex items-center gap-x-[10px] absolute bottom-[16px] left-[20px]">
                <Chat />
                <h3 className="text-white font-sans font-medium text-sm">Форум/Чат</h3>
              </div>
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-auto max-h-[180px] object-cover"
              />
            </div>
            <div className="bg-[#E9E9F0] p-[15px]">
              <div className="flex justify-between items-center mb-[15px]">
                <h2 className="font-sans text-xl text-[#192E51] font-bold">{title}</h2>
                <Button variant="outlined" onClick={() => setIsChangePhotoOpen(true)}>
                  Change Photo
                </Button>
              </div>
              <nav className="flex flex-wrap gap-[7px]">
                {links.map(({ link, text }) => (
                  <a
                    key={link}
                    href={link}
                    className="text-xs font-sans text-center text-white bg-[#607698] p-[7px] rounded-[50px] hover:bg-[#7a96c0] duration-200 min-w-[100px] flex-[1_1_calc(33.33%-7px)]"
                  >
                    {text}
                  </a>
                ))}
                <Button
                  variant="contained"
                  onClick={() => setIsAddLinkOpen(true)}
                  sx={{ mt: pxToRem(10) }}
                >
                  Add Link
                </Button>
              </nav>
            </div>
          </div>
        ) : (
          <DropdownMenu.Root open={isLinksOpen} onOpenChange={setIsLinksOpen}>
            <DropdownMenu.Trigger className="w-full focus:outline-none">
              <div className="w-full relative">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-auto max-h-[180px] object-cover"
                />
              </div>
              <div className={`p-[10px] ${isLinksOpen ? 'bg-[#d8d8df]' : 'bg-[#E9E9F0]'}`}>
                <div className="flex justify-between items-center">
                  <h2 className="font-sans text-xs">{title}</h2>
                  <div className={`duration-200 ${isLinksOpen ? '-rotate-180' : 'rotate-0'}`}>
                    <ExpandArrow />
                  </div>
                </div>
                <Button
                  variant="outlined"
                  onClick={() => setIsChangePhotoOpen(true)}
                  sx={{ mt: pxToRem(10) }}
                >
                  Change Photo
                </Button>
                <DropdownMenu.Content className="w-[var(--radix-popper-anchor-width)]">
                  <div
                    className="p-[10px] pb-[15px] pt-0 flex flex-wrap gap-y-[10px] w-full bg-[#d8d8df] rounded-b-[25px] mx-auto"
                    style={{
                      clipPath: downAnimation
                        ? 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)'
                        : 'polygon(0 0, 100% 0, 100% 0, 0 0)',
                    }}
                  >
                    {links.map(({ link, text }) => (
                      <a
                        key={link}
                        href={link}
                        className="text-xs block font-sans text-center text-white bg-[#607698] p-[7px] rounded-[50px] hover:bg-[#7a96c0] duration-200 w-full"
                      >
                        {text}
                      </a>
                    ))}
                    <Button
                      variant="contained"
                      onClick={() => setIsAddLinkOpen(true)}
                      sx={{ mt: pxToRem(10) }}
                    >
                      Add Link
                    </Button>
                  </div>
                </DropdownMenu.Content>
              </div>
            </DropdownMenu.Trigger>
          </DropdownMenu.Root>
        )}
      </Tag>

      {/* Dialog для добавления ссылки */}
      <Dialog open={isAddLinkOpen} onClose={() => setIsAddLinkOpen(false)}>
        <form onSubmit={handleSubmitLink(onSubmitLink)}>
          <DialogTitle>Add Link to {title}</DialogTitle>
          <DialogContent>
            <TextField
              label="Link Name"
              fullWidth
              {...registerLink('name')}
              error={!!linkErrors.name}
              helperText={linkErrors.name?.message}
              sx={{ mb: pxToRem(15) }}
            />
            <TextField
              label="URL"
              fullWidth
              {...registerLink('url')}
              error={!!linkErrors.url}
              helperText={linkErrors.url?.message}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAddLinkOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLinkPending}>
              {isLinkPending ? <CircularProgress size={20} /> : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog для изменения фото */}
      <Dialog open={isChangePhotoOpen} onClose={() => setIsChangePhotoOpen(false)}>
        <form onSubmit={handleSubmitPhoto(onSubmitPhoto)}>
          <DialogTitle>Change Photo for {title}</DialogTitle>
          <DialogContent>
            <TextField
              label="Photo"
              type="file"
              fullWidth
              InputLabelProps={{ shrink: true }}
              {...registerPhoto('photo')}
              error={!!photoErrors.photo}
              helperText={photoErrors.photo?.message}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsChangePhotoOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPhotoPending}>
              {isPhotoPending ? <CircularProgress size={20} /> : 'Update'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};