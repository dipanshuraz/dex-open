import { SUPPORTED_CHAINS } from "@/lib/config";
import { EVM_ADDRESS_REGEX } from "@/lib/constants";

export function isValidChain(chain: string): boolean {
  return SUPPORTED_CHAINS.includes(chain.toLowerCase());
}

export function isValidTokenAddress(address: string): boolean {
  return EVM_ADDRESS_REGEX.test(address);
}

export function validateTokenRoute(chain: string, tokenAddress: string): boolean {
  return isValidChain(chain) && isValidTokenAddress(tokenAddress);
}
