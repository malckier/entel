import {
  Box,
  Heading,
  ListItem,
  Flex,
  Text,
  UnorderedList,
  Collapse,
  useDisclosure,
  Divider,
  Button,
  List,
  HStack,
  createStandaloneToast,
} from "@chakra-ui/react"
import { InfoIcon } from "@chakra-ui/icons"
import { useMutation, useQuery } from "blitz"
import acceptList from "../mutations/acceptList"
import { useState } from "react"
import { BiShoppingBag, BiUserCircle, BiStore } from "react-icons/bi"
import createChat from "../mutations/createChat"
import createAdminMessage from "../mutations/createAdminMessage"
import getChatByParticipants from "../queries/getChatByParticipants"

interface PublicListProps {
  distance: Number
  marketName: String
  itemsList: String[]
  ownerName: String
  ownerId: number
  specialWish?: String
  listId: Number
  refetch
}
export default function PublicList({
  distance,
  marketName,
  itemsList,
  ownerName,
  ownerId,
  specialWish,
  listId,
  refetch,
}: PublicListProps) {
  const { isOpen, onToggle } = useDisclosure()
  const [isHovered, onHover] = useState(false)
  const [acceptListMutation] = useMutation(acceptList)
  const [createChatMutation] = useMutation(createChat)
  const [createAdminMessageMutation] = useMutation(createAdminMessage)
  const [chat] = useQuery(getChatByParticipants, { ownerId })
  const toast = createStandaloneToast()
  return (
    <Flex
      justifyContent="space-between"
      flexDirection="column"
      borderWidth="2px"
      width="sm"
      margin="0.5rem"
      borderRadius="lg"
      borderColor="brandGreen.800"
      onClick={onToggle}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      overflow="visible"
    >
      <Flex paddingX="1rem" paddingY=".5rem" justifyContent="space-between" flexDirection="row">
        <Box>
          <Heading color="brandGreen.900" fontSize="2xl">
            {Number.isNaN(distance) ? "∞" : distance == 0 ? "<1" : distance} km
          </Heading>
          <HStack>
            <BiUserCircle />
            <Text>{ownerName}</Text>
          </HStack>
        </Box>
        <Box wordBreak="break-word">
          <HStack>
            <Text>{itemsList.length} item(s)</Text>
            <BiShoppingBag />
          </HStack>
          <HStack>
            <Text>{marketName}</Text>
            <BiStore />
          </HStack>
        </Box>
      </Flex>
      <Collapse in={isOpen} animateOpacity>
        <Divider height="0.25rem" color="black" />
        <Flex padding="0.5rem" justifyContent="space-between" flexDirection="column">
          <UnorderedList>
            {itemsList.map((item) => {
              return <ListItem>{item}</ListItem>
            })}
          </UnorderedList>
          {specialWish && (
            <Text>
              <InfoIcon color="brandGreen.700" /> {specialWish}
            </Text>
          )}
          <Button
            variant="brand"
            marginTop="0.5rem"
            onClick={async () => {
              await acceptListMutation(listId)
              refetch()
              if (chat) {
                await createAdminMessageMutation({
                  content:
                    "Here you can talk about your most recent accepted/created Shoppinglist. Please be nice!",
                  chatId: chat.id,
                })
              } else {
                const chatId = await createChatMutation({ opponentId: ownerId })
                await createAdminMessageMutation({
                  content:
                    "Here you can talk about your most recent accepted/created Shoppinglist. Please be nice!",
                  chatId: chatId.id,
                })
              }

              toast({
                title: "Successfully Accepted List",
                description: "You will find your accepted lists under 'Active Lists'",
                status: "success",
                duration: 5000,
                isClosable: true,
              })
            }}
          >
            {" "}
            Accept{" "}
          </Button>
        </Flex>
      </Collapse>
      <Collapse in={isHovered && !isOpen} animateOpacity>
        <Flex
          textAlign="center"
          justifyContent="center"
          _hover={{ background: "brandGreen.600", cursor: "pointer" }}
          backgroundColor="brandGreen.500"
          textColor="white"
          flexDirection="column"
          height="1.5rem"
        >
          <Text fontSize="1rem" fontWeight="semibold">
            show more
          </Text>
        </Flex>
      </Collapse>
    </Flex>
  )
}
