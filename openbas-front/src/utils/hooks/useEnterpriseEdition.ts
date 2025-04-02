/*
Copyright (c) 2021-2024 Filigran SAS

This file is part of the OpenCTI Enterprise Edition ("EE") and is
licensed under the OpenCTI Non-Commercial License (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

https://github.com/OpenCTI-Platform/opencti/blob/master/LICENSE

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*/

import useAuth from './useAuth';

const useEnterpriseEdition = (): boolean => {
  const { settings } = useAuth();
  return settings.platform_license?.license_is_validated === true;
};

export default useEnterpriseEdition;
